jest.mock('../../../../app/overnight/expired-cdo')
const { setExpiredCdosToFailed } = require('../../../../app/overnight/expired-cdo')

jest.mock('../../../../app/overnight/expired-insurance')
const { setExpiredInsuranceToBreach } = require('../../../../app/overnight/expired-insurance')

jest.mock('../../../../app/overnight/expired-neutering-deadline')
const { setExpiredNeuteringDeadlineToInBreach } = require('../../../../app/overnight/expired-neutering-deadline')

const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')

jest.mock('../../../../app/lib/environment-helpers')
const { getEnvironmentVariableOrString } = require('../../../../app/lib/environment-helpers')

describe('AutoUpdateStatus test', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  test('autoUpdateStatuses should handle successful results', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering 2 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - insurance 2 rows | ok - neutering 2 rows')
  })

  test('autoUpdateStatuses should handle errors', async () => {
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockImplementation(() => { throw new Error('dummy error') })
    const res = await autoUpdateStatuses()
    expect(res).toBe('Error auto-updating statuses: Error: dummy error ok - cdos 1 rows | ')
  })

  test('autoUpdateStatuses should run today as 2024-07-27 in dev', async () => {
    getEnvironmentVariableOrString.mockResolvedValue('aphw-ddi-events-dev')
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 1 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering 2 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 1 rows | ok - insurance 2 rows | ok - neutering 2 rows')
    expect(setExpiredNeuteringDeadlineToInBreach).toHaveBeenCalledWith(new Date('2024-07-27'), expect.anything(), undefined)
  })

  test('autoUpdateStatuses should run today as 2024-07-27 in snd', async () => {
    getEnvironmentVariableOrString.mockResolvedValue('aphw-ddi-events-snd')
    setExpiredCdosToFailed.mockResolvedValue('ok - cdos 2 rows')
    setExpiredInsuranceToBreach.mockResolvedValue('ok - insurance 2 rows')
    setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('ok - neutering 2 rows')
    const res = await autoUpdateStatuses()
    expect(res).toBe('ok - cdos 2 rows | ok - insurance 2 rows | ok - neutering 2 rows')
    expect(setExpiredNeuteringDeadlineToInBreach).toHaveBeenCalledWith(new Date('2024-07-27'), expect.anything(), undefined)
  })
})
