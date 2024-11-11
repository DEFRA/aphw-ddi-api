const { jobs: mockJobs } = require('../../../mocks/jobs')

describe('RegularJobs repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    models: {
      regular_job: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    })
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/overnight/auto-update-statuses')
  const { autoUpdateStatuses } = require('../../../../app/overnight/auto-update-statuses')

  jest.mock('../../../../app/overnight/create-export-file')
  const { createExportFile } = require('../../../../app/overnight/create-export-file')

  const { tryStartJob, endJob, getRegularJobs, createNewJob, updateRunningJobProgress, hasJobRunBefore } = require('../../../../app/repos/regular-jobs')

  beforeEach(async () => {
    jest.clearAllMocks()
    autoUpdateStatuses.mockResolvedValue('autoUpdate ok')
    createExportFile.mockResolvedValue('export file ok')
  })

  test('tryStartJob should not start new transaction if passed', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue({ id: 1, run_date: new Date() })
    await tryStartJob({})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('tryStartJob should start new transaction if none passed', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue({ id: 1, run_date: new Date() })

    await tryStartJob()

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(sequelize.models.regular_job.findOne).toHaveBeenCalledTimes(1)
  })

  test('tryStartJob should return null if existing job running', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue({ id: 1, run_date: new Date() })

    const result = await tryStartJob({})

    expect(result).toBe(null)
  })

  test('tryStartJob should return new jobId if no existing job running', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue(null)
    sequelize.models.regular_job.create.mockResolvedValue({ id: 2, run_date: new Date() })

    const result = await tryStartJob({})

    expect(result).toBe(2)
  })

  test('tryStartJob should throw when error', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue(null)
    sequelize.models.regular_job.create.mockImplementation(() => { throw new Error('dummy error') })

    await expect(tryStartJob({})).rejects.toThrow('dummy error')
  })

  test('endJob should start new transaction if none passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.regular_job.findByPk.mockResolvedValue({ id: 3, run_date: new Date(), save: mockSave })

    await endJob(123, 'text')

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('endJob should not start new transaction if passed', async () => {
    const mockSave = jest.fn()
    sequelize.models.regular_job.findByPk.mockResolvedValue({ id: 3, run_date: new Date(), save: mockSave })

    await endJob(123, 'text', {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('endJob should update existing job', async () => {
    const mockSave = jest.fn()
    sequelize.models.regular_job.findByPk.mockResolvedValue({ id: 3, run_date: new Date(), save: mockSave })

    await endJob(3, 'result text', {})

    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  test('endJob should error if existing job not found', async () => {
    sequelize.models.regular_job.findByPk.mockResolvedValue()

    await expect(endJob(3, 'result text', {})).rejects.toThrow('Overnight jobId 3 not found')
  })

  test('endJob should error if error thrown', async () => {
    sequelize.models.regular_job.findByPk.mockImplementation(() => { throw new Error('dummy error') })

    await expect(endJob(3, 'result text', {})).rejects.toThrow('Error finishing overnight job: 3 Error: dummy error')
  })

  test('getRegularJobs should return jobs', async () => {
    sequelize.models.regular_job.findAll.mockResolvedValue(mockJobs)

    await getRegularJobs()

    expect(sequelize.models.regular_job.findAll).toHaveBeenCalledTimes(1)
  })

  test('getRegularJobs should error if DB error', async () => {
    sequelize.models.regular_job.findAll.mockImplementation(() => { throw new Error('DB error') })

    await expect(getRegularJobs()).rejects.toThrow('DB error')
  })

  test('createNewJob should call create', async () => {
    sequelize.models.regular_job.create.mockResolvedValue({ id: 123 })

    const res = await createNewJob()

    expect(res.id).toBe(123)

    expect(sequelize.models.regular_job.create).toHaveBeenCalledTimes(1)
  })

  test('updateRunningJobProgress should call update existing job', async () => {
    const mockSave = jest.fn()
    sequelize.models.regular_job.findByPk.mockResolvedValue({ id: 123, result: 'Some initial text', save: mockSave })

    const res = await updateRunningJobProgress(123, 'Extra text to add')

    expect(res.id).toBe(123)
    expect(res.result).toBe('Some initial text Extra text to add')
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  test('updateRunningJobProgress should add text to existing', async () => {
    const mockSave = jest.fn()
    sequelize.models.regular_job.findByPk.mockResolvedValue({ id: 123, result: null, save: mockSave })

    const res = await updateRunningJobProgress(123, 'Extra text to add')

    expect(res.id).toBe(123)
    expect(res.result).toBe(' Extra text to add')
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  test('hasJobRunBefore should return true if job exists', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue({ id: 123 })

    const res = await hasJobRunBefore('revert')

    expect(res).toBeTruthy()

    expect(sequelize.models.regular_job.findOne).toHaveBeenCalledTimes(1)
  })

  test('hasJobRunBefore should return false if job not found', async () => {
    sequelize.models.regular_job.findOne.mockResolvedValue()

    const res = await hasJobRunBefore('revert')

    expect(res).toBeFalsy()

    expect(sequelize.models.regular_job.findOne).toHaveBeenCalledTimes(1)
  })

  test('hasJobRunBefore should error if DB error', async () => {
    sequelize.models.regular_job.findOne.mockImplementation(() => { throw new Error('DB error') })

    await expect(hasJobRunBefore('revert')).rejects.toThrow('DB error')
  })
})
