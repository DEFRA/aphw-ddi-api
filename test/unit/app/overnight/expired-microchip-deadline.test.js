const { setExpiredMicrochipDeadlineToInBreach } = require('../../../../app/overnight/expired-microchip-deadline')
const { overnightRows: mockOvernightRows } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

describe('ExpiredMicrochipDeadline test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
  })

  test('setExpiredMicrochipDeadlineToInBreach should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await setExpiredMicrochipDeadlineToInBreach()
    expect(res).toBe('Success Microchip Expiry - updated 0 rows')
  })

  test('setExpiredMicrochipDeadlineToInBreach should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredMicrochipDeadlineToInBreach).rejects.toThrow('dummy error')
  })

  test('setExpiredMicrochipDeadlineToInBreach should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredMicrochipDeadlineToInBreach()
    expect(res).toBe('Success Microchip Expiry - updated 3 rows')
  })
})
