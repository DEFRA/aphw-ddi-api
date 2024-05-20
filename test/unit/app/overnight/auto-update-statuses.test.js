const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')

const { setExpiredCdosToFailed } = require('../../../../app/overnight/expired-cdo')
jest.mock('../../../../app/overnight/expired-cdo')

const { setExpiredInsuranceToBreach } = require('../../../../app/overnight/expired-insurance')
jest.mock('../../../../app/overnight/expired-insurance')

describe('AutoUpdateStatus test', () => {
  test('autoUpdateStatuses should handle successful results', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance 2 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - insurance 2 rows | ')
  })

  test('autoUpdateStatuses should handle errors', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockImplementation(() => { throw new Error('dummy error') })
    const res = await autoUpdateStatuses()
    expect(res).toBe('Error auto-updating statuses: Error: dummy error ok - cdos 1 rows | ')
  })
})
