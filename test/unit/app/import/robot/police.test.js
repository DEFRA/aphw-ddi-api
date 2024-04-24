const { lookupPoliceForceByPostcode, matchPoliceForceByName } = require('../../../../../app/import/robot/police')

jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')

jest.mock('../../../../../app/import/robot/postcode')
const { getPostcodeLongLat } = require('../../../../../app/import/robot/postcode')

jest.mock('../../../../../app/repos/police-forces')
const { getPoliceForces } = require('../../../../../app/repos/police-forces')

describe('police lookup import', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getPoliceForces.mockResolvedValue([{ name: 'Met Police' }])
  })

  describe('lookupPoliceForceByPostcode', () => {
    test('should return payload', async () => {
      getPostcodeLongLat.mockResolvedValue({ lng: 123, lat: 456 })
      wreck.get.mockResolvedValue({ payload: { force: 'met-police' } })
      const result = await lookupPoliceForceByPostcode('TS1 1TS')

      expect(result).not.toBe(null)
      expect(result.name).toBe('Met Police')
    })

    test('should handle error', async () => {
      wreck.get.mockImplementation(() => { throw new Error('Postcode not found') })
      const result = await lookupPoliceForceByPostcode('TS1 1TS')

      expect(result).toBe(null)
    })
  })

  describe('getPoliceForce', () => {
    test('should rate limit and retry 3 times', async () => {
      wreck.get.mockImplementation(() => {
        const error = new Error('Police force rate limiting')
        error.output = { statusCode: 429 }
        throw error
      })

      const result = await lookupPoliceForceByPostcode('TS1 1TS')

      expect(wreck.get).toHaveBeenCalledTimes(3)
      expect(result).toBe(null)
    })

    test('should handle errors other than rate limit and not retry', async () => {
      wreck.get.mockImplementation(() => {
        const error = new Error('Police force rate limiting')
        error.output = { statusCode: 400 }
        throw error
      })

      const result = await lookupPoliceForceByPostcode('TS1 1TS')

      expect(wreck.get).toHaveBeenCalledTimes(1)
      expect(result).toBe(null)
    })
  })

  describe('matchPoliceForceByName', () => {
    test('should handle null name', async () => {
      getPoliceForces.mockResolvedValue([{ name: 'Met Police' }])

      const result = await matchPoliceForceByName(null)

      expect(result).toBe(null)
    })

    test('should match mixed case name', async () => {
      getPoliceForces.mockResolvedValue([
        { name: 'Met Police' },
        { name: 'Yorkshire Police' }
      ])

      const result = await matchPoliceForceByName('met police')

      expect(result).not.toBe(null)
      expect(result.name).toBe('Met Police')
    })

    test('should match with name with hyphens', async () => {
      getPoliceForces.mockResolvedValue([
        { name: 'Met Police' },
        { name: 'Yorkshire Police' }
      ])

      const result = await matchPoliceForceByName('met-police')

      expect(result).not.toBe(null)
      expect(result.name).toBe('Met Police')
    })

    test('should not match if name doesnt exist', async () => {
      getPoliceForces.mockResolvedValue([
        { name: 'Met Police' },
        { name: 'Yorkshire Police' }
      ])

      const result = await matchPoliceForceByName('pet police')

      expect(result).toBe(undefined)
    })
  })
})
