const { validRow } = require('./input-data')

const { createExportFile } = require('../../../../app/overnight/create-export-file')

jest.mock('../../../../app/repos/cdo')
const { getAllCdos } = require('../../../../app/repos/cdo')

jest.mock('../../../../app/storage')
const { uploadInboundFile } = require('../../../../app/storage')

describe('CreateExportFile test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should handle success', async () => {
    getAllCdos.mockResolvedValue([validRow])
    uploadInboundFile.mockResolvedValue()

    const res = await createExportFile()

    expect(res).toBe('Success Export (1 rows)')
    expect(uploadInboundFile).toHaveBeenCalledWith(expect.anything(), 'daily_export.csv')
  })

  test('should handle error', async () => {
    getAllCdos.mockImplementation(() => { throw new Error('cdo error') })
    uploadInboundFile.mockResolvedValue()

    const res = await createExportFile()

    expect(res).toBe('Error create export file: Error: cdo error')
    expect(uploadInboundFile).not.toHaveBeenCalled()
  })
})
