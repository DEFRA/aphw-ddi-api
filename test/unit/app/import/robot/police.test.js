jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')
const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

describe('police lookup import', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('lookupPoliceForceByPostcode should return payload', async () => {
    wreck.get.mockResolvedValue({ payload: { dataVal: 123 } })
    const result = await lookupPoliceForceByPostcode('TS1 1TS')

    expect(result).not.toBe(null)
    expect(result.dataVal).toBe(123)
  })

  test('lookupPoliceForceByPostcode should handle error', async () => {
    wreck.get.mockImplementation(() => { throw new Error('Postcode not found') })
    const result = await lookupPoliceForceByPostcode('TS1 1TS')

    expect(result).toBe(null)
  })
})
