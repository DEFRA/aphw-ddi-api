const { createExportFile, generateCsv } = require('../../../../app/overnight/create-export-file')
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

  describe('generateCsv', () => {
    test('should handle single batch', async () => {
      getAllCdos.mockResolvedValue([validRow, validRow, validRow])
      updateRunningJobProgress.mockResolvedValue()
      const res = await generateCsv()
      expect(res.numRowsExported).toBe(3)
      expect(res.exportedData.indexOf('\n', 0)).toBe(743)
      expect(res.exportedData.indexOf('\n', 744)).toBe(1327)
      expect(res.exportedData.indexOf('\n', 1328)).toBe(1911)
      expect(res.exportedData.indexOf('\n', 1912)).toBe(-1)
    })

    test('should handle multiple batches with linefeed between each batch', async () => {
      getAllCdos
        .mockResolvedValueOnce([validRow, validRow])
        .mockResolvedValueOnce([validRow, validRow])
        .mockResolvedValueOnce([validRow, validRow])
        .mockResolvedValueOnce([])
      updateRunningJobProgress.mockResolvedValue()
      const res = await generateCsv(1)
      expect(res.numRowsExported).toBe(6)
      expect(res.exportedData.indexOf('\n', 0)).toBe(743)
      expect(res.exportedData.indexOf('\n', 744)).toBe(1327)
      expect(res.exportedData.indexOf('\n', 1328)).toBe(1911)
      expect(res.exportedData.indexOf('\n', 1912)).toBe(2495)
      expect(res.exportedData.indexOf('\n', 2496)).toBe(3079)
      expect(res.exportedData.indexOf('\n', 3080)).toBe(3663)
      expect(res.exportedData.indexOf('\n', 3664)).toBe(4247)
      expect(res.exportedData.indexOf('\n', 4248)).toBe(-1)
    })
  })
})
