const { statuses: mockStatuses } = require('../../../mocks/statuses')

describe('Status repo', () => {
  jest.mock('../../../../app/repos/search')
  const { updateSearchIndexDog } = require('../../../../app/repos/search')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/repos/dogs')
  const { getDogByIndexNumber, getCachedStatuses } = require('../../../../app/repos/dogs')

  const { updateStatusOnly } = require('../../../../app/repos/status')

  beforeEach(async () => {
    jest.clearAllMocks()
    getCachedStatuses.mockResolvedValue(mockStatuses)
    updateSearchIndexDog.mockResolvedValue()
    sendUpdateToAudit.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 123, index_number: 'ED123' })
  })

  test('updateStatusOnly should save to dog', async () => {
    const mockSave = jest.fn()
    const dog = { index_number: 'ED123', id: 123, save: mockSave }

    await updateStatusOnly(dog, 'Exempt', {})

    expect(dog.save).toHaveBeenCalledTimes(1)
  })
})
