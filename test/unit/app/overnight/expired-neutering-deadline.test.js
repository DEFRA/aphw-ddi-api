const { setExpiredNeuteringDeadlineToInBreach } = require('../../../../app/overnight/expired-neutering-deadline')
const { overnightRows: mockOvernightRows } = require('../../../mocks/overnight/overnight-rows')

const { dbFindAll } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

const { updateStatusOnly } = require('../../../../app/repos/status')
jest.mock('../../../../app/repos/status')

describe('ExpiredNeuteringDeadline test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
    updateStatusOnly.mockResolvedValue()
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle zero rows', async () => {
    dbFindAll.mockResolvedValue([])
    const res = await setExpiredNeuteringDeadlineToInBreach()
    expect(res).toBe('Success Neutering Expiry - updated 0 rows')
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle error', async () => {
    dbFindAll.mockImplementation(() => { throw new Error('dummy error') })
    await expect(setExpiredNeuteringDeadlineToInBreach).rejects.toThrow('dummy error')
  })

  test('setExpiredNeuteringDeadlineToInBreach should handle some rows', async () => {
    dbFindAll.mockResolvedValue(mockOvernightRows)
    const res = await setExpiredNeuteringDeadlineToInBreach()
    expect(res).toBe('Success Neutering Expiry - updated 3 rows')
  })
})
