const mockTransaction = jest.fn()
jest.mock('../../../../app/config/db', () => ({
  transaction: jest.fn().mockImplementation(async (fn) => {
    return await fn(mockTransaction)
  })
}))

jest.mock('../../../../app/overnight/expired-cdo')
const { setExpiredCdosToFailed } = require('../../../../app/overnight/expired-cdo')

jest.mock('../../../../app/overnight/expired-insurance')
const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../../../../app/overnight/expired-insurance')

jest.mock('../../../../app/overnight/expired-neutering-deadline')
const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../../../../app/overnight/expired-neutering-deadline')

jest.mock('../../../../app/overnight/expired-microchip-deadline')
const { setExpiredMicrochipDeadlineToInBreach, addBreachReasonToExpiredMicrochipDeadline } = require('../../../../app/overnight/expired-microchip-deadline')

jest.mock('../../../../app/repos/regular-jobs')
const { hasJobRunBefore } = require('../../../../app/repos/regular-jobs')

jest.mock('../../../../app/overnight/revert-expired-insurance')
const { revertExpiredInsurance } = require('../../../../app/overnight/revert-expired-insurance')

const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')

const overnightJobUser = {
  username: 'overnight-job-system-user',
  displayname: 'Overnight Job System User',
  scope: 'Dog.Index.Admin'
}

describe('AutoUpdateStatus test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    hasJobRunBefore.mockResolvedValue(true)
  })

  test('autoUpdateStatuses should handle successful results when not running revertExpiredInsurance', async () => {
    revertExpiredInsurance.mockResolvedValue('ok - revert 3 rows')
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    addBreachReasonToExpiredInsurance.mockResolvedValue('ok - insurance add reason 2 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance to breach 2 rows')
    addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('ok - neutering add reason 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering to breach 2 rows')
    addBreachReasonToExpiredMicrochipDeadline.mockResolvedValue('ok - microchip add reason 3 rows')
    setExpiredMicrochipDeadlineToInBreach.mockResolvedValue('ok - microchip to breach 4 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - insurance add reason 2 rows | ok - insurance to breach 2 rows | ok - neutering add reason 2 rows | ok - neutering to breach 2 rows | ok - microchip add reason 3 rows | ok - microchip to breach 4 rows')
    expect(setExpiredNeuteringDeadlineToInBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredMicrochipDeadlineToInBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredInsuranceToBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredCdosToFailed).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredInsurance).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredNeuteringDeadline).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredMicrochipDeadline).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(revertExpiredInsurance).not.toHaveBeenCalled()
  })

  test('autoUpdateStatuses should handle successful results when not running revertExpiredInsurance', async () => {
    hasJobRunBefore.mockResolvedValue(false)
    revertExpiredInsurance.mockResolvedValue('ok - revert 3 rows')
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    addBreachReasonToExpiredInsurance.mockResolvedValue('ok - insurance add reason 2 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance to breach 2 rows')
    addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('ok - neutering add reason 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering to breach 2 rows')
    addBreachReasonToExpiredMicrochipDeadline.mockResolvedValue('ok - microchip add reason 3 rows')
    setExpiredMicrochipDeadlineToInBreach.mockResolvedValue('ok - microchip to breach 4 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - revert 3 rows | ok - insurance add reason 2 rows | ok - insurance to breach 2 rows | ok - neutering add reason 2 rows | ok - neutering to breach 2 rows | ok - microchip add reason 3 rows | ok - microchip to breach 4 rows')
    expect(setExpiredNeuteringDeadlineToInBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredMicrochipDeadlineToInBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredInsuranceToBreach).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(setExpiredCdosToFailed).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredInsurance).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredNeuteringDeadline).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(addBreachReasonToExpiredMicrochipDeadline).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
    expect(revertExpiredInsurance).toHaveBeenCalledWith(expect.any(Date), overnightJobUser, expect.anything())
  })

  test('autoUpdateStatuses should handle errors', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockImplementation(() => { throw new Error('dummy error') })
    const res = await autoUpdateStatuses()
    expect(res).toBe('Error auto-updating statuses: Error: dummy error ok - cdos 1 rows | ok - insurance add reason 2 rows | ')
  })
})
