jest.mock('../../../../app/overnight/expired-cdo')
const { setExpiredCdosToFailed } = require('../../../../app/overnight/expired-cdo')

jest.mock('../../../../app/overnight/expired-insurance')
const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../../../../app/overnight/expired-insurance')

jest.mock('../../../../app/overnight/expired-neutering-deadline')
const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../../../../app/overnight/expired-neutering-deadline')

const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')

const overnightJobUser = {
  username: 'overnight-job-system-user',
  displayname: 'Overnight Job System User',
  scope: 'Dog.Index.Admin'
}

describe('AutoUpdateStatus test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('autoUpdateStatuses should handle successful results', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    addBreachReasonToExpiredInsurance.mockResolvedValue('ok - insurance add reason 2 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance to breach 2 rows')
    addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('ok - neutering add reason 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering to breach 2 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - insurance add reason 2 rows | ok - insurance to breach 2 rows | ok - neutering add reason 2 rows | ok - neutering to breach 2 rows')
    expect(setExpiredNeuteringDeadlineToInBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredInsuranceToBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredCdosToFailed).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredInsurance).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredNeuteringDeadline).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
  })

  test('autoUpdateStatuses should handle errors', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockImplementation(() => { throw new Error('dummy error') })
    const res = await autoUpdateStatuses()
    expect(res).toBe('Error auto-updating statuses: Error: dummy error ok - cdos 1 rows | ok - insurance add reason 2 rows | ')
  })
})
