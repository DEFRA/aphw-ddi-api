const { getPostcodeLongLat } = require('../../../../../app/import/robot/postcode')

jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')

describe('postcode lookup import', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return payload', async () => {
    wreck.get.mockResolvedValue({ payload: { results: [{ DPA: { LNG: 12345, LAT: 23456 } }] } })
    const result = await getPostcodeLongLat('TS1 1TS')

    expect(result).not.toBe(null)
    expect(result.lng).toBe(12345)
    expect(result.lat).toBe(23456)
  })

  test('should handle null payload', async () => {
    wreck.get.mockResolvedValue({ payload: null })
    const result = await getPostcodeLongLat('TS1 1TS')

    expect(result).toBe(null)
  })

  test('should handle error', async () => {
    wreck.get.mockImplementation(() => { throw new Error('Postcode not found') })
    const result = await getPostcodeLongLat('TS1 1TS')

    expect(result).toBe(null)
  })
})
