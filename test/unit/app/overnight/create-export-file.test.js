const { createExportFile } = require('../../../../app/overnight/create-export-file')
const { validRow } = require('../../../unit/app/export/input-data')

const { getAllCdos } = require('../../../../app/repos/cdo')
jest.mock('../../../../app/repos/cdo')

const { uploadExportedFile } = require('../../../../app/storage/repos/export')
jest.mock('../../../../app/storage/repos/export')

const { updateRunningJobProgress } = require('../../../../app/repos/regular-jobs')
jest.mock('../../../../app/repos/regular-jobs')

describe('CreateExportFile test', () => {
  test('getAllCdosInBatches should handle zero batch size', async () => {
    getAllCdos.mockResolvedValue([validRow])
    uploadExportedFile.mockResolvedValue()
    updateRunningJobProgress.mockResolvedValue()
    const res = await createExportFile(0)
    expect(res).toBe('Success Export (1 rows, batches of 0) - try 1')
    expect(getAllCdos).toHaveBeenCalledWith()
  })

  test('getAllCdosInBatches should handle provided batch size', async () => {
    getAllCdos
      .mockResolvedValueOnce([validRow])
      .mockResolvedValueOnce([validRow])
      .mockResolvedValueOnce([])
    uploadExportedFile.mockResolvedValue()
    updateRunningJobProgress.mockResolvedValue()
    const res = await createExportFile(1500)
    expect(res).toBe('Success Export (2 rows, batches of 1500) - try 1')
    expect(getAllCdos).toHaveBeenCalledWith(1, 1500)
  })
})
