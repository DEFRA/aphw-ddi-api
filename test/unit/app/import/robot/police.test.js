jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')

jest.mock('../../../../../app/import/robot/postcode')
const { getPostcodeLongLat } = require('../../../../../app/import/robot/postcode')

jest.mock('../../../../../app/repos/police-forces')
const { getPoliceForceByShortName } = require('../../../../../app/repos/police-forces')

const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

describe('police lookup import', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getPoliceForceByShortName.mockResolvedValue(null)
  })

  describe('lookupPoliceForceByPostcode', () => {
    test('should return payload', async () => {
      getPoliceForceByShortName.mockResolvedValue({ name: 'Met Police' })
      getPostcodeLongLat.mockResolvedValue({ lng: 123, lat: 456 })
      wreck.get.mockResolvedValue({ payload: { force: 'met-police' } })
      const result = await lookupPoliceForceByPostcode('TS1 1TS')

      expect(result).not.toBe(null)
      expect(result.name).toBe('Met Police')
    })

    test('should handle error', async () => {
      wreck.get.mockImplementation(() => { throw new Error('Postcode not found') })
      const result = await lookupPoliceForceByPostcode('TS1 1TS', {})

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
})
