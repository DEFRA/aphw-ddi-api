const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

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

  test('lookupPoliceForceByPostcode should return payload', async () => {
    getPostcodeLongLat.mockResolvedValue({ lng: 123, lat: 456 })
    wreck.get.mockResolvedValue({ payload: { force: 'met-police' } })
    const result = await lookupPoliceForceByPostcode('TS1 1TS')

    expect(result).not.toBe(null)
    expect(result.name).toBe('Met Police')
  })

  test('lookupPoliceForceByPostcode should handle error', async () => {
    wreck.get.mockImplementation(() => { throw new Error('Postcode not found') })
    const result = await lookupPoliceForceByPostcode('TS1 1TS')

    expect(result).toBe(null)
  })
})
