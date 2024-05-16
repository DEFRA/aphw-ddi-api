const { validRow } = require('./input-data')

const { createExportFile } = require('../../../../app/overnight/create-export-file')

jest.mock('../../../../app/repos/cdo')
const { getAllCdos } = require('../../../../app/repos/cdo')

jest.mock('../../../../app/storage/repos/export')
const { uploadExportedFile } = require('../../../../app/storage/repos/export')

describe('CreateExportFile test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should handle success', async () => {
    getAllCdos.mockResolvedValue([validRow])
    uploadExportedFile.mockResolvedValue()

    const res = await createExportFile()

    expect(res).toBe('Success Export (1 rows, batches of 0) - try 1')
    expect(uploadExportedFile).toHaveBeenCalledWith(expect.anything(), 'daily_export.csv')
    expect(getAllCdos).toHaveBeenCalledTimes(1)
  })

  test('should handle error with retry', async () => {
    getAllCdos.mockImplementation(() => { throw new Error('cdo error') })
    uploadExportedFile.mockResolvedValue()

    const res = await createExportFile()

    expect(res).toBe('Error create export file: Error: cdo error - try 3')
    expect(uploadExportedFile).not.toHaveBeenCalled()
    expect(getAllCdos).toHaveBeenCalledTimes(3)
  })
})
