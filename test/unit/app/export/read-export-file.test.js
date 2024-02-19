describe('ReadFile test', () => {
  const DEFAULT_ENV = process.env

  let blobServiceClient

  const mockClientBlobExists = {
    getContainerClient: jest.fn().mockImplementation(() => {
      return {
        getBlockBlobClient: jest.fn().mockImplementation(() => {
          return {
            exists: jest.fn().mockImplementation(() => Promise.resolve(true)),
            downloadToBuffer: jest.fn().mockImplementation(() => 'content')
          }
        })
      }
    })
  }

  const mockClientBlobNotExists = {
    getContainerClient: jest.fn().mockImplementation(() => {
      return {
        getBlockBlobClient: jest.fn().mockImplementation(() => {
          return {
            exists: jest.fn().mockImplementation(() => Promise.resolve(false)),
            downloadToBuffer: jest.fn().mockImplementation(() => 'content')
          }
        })
      }
    })
  }

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/storage-blob')

    blobServiceClient = require('@azure/storage-blob').BlobServiceClient

    process.env = { ...DEFAULT_ENV }
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'true'

    blobServiceClient.fromConnectionString.mockReturnValue(mockClientBlobExists)
  })

  test('should handle success', async () => {
    require('../../../../app/storage/get-blob-client')

    const { readExportFile } = require('../../../../app/export/read-export-file')

    const res = await readExportFile()

    expect(res).toBe('content')
  })

  test('should handle error', async () => {
    blobServiceClient.fromConnectionString.mockReturnValue(mockClientBlobNotExists)

    require('../../../../app/storage/get-blob-client')

    const { readExportFile } = require('../../../../app/export/read-export-file')

    await expect(readExportFile).rejects.toThrow('File daily_export.csv does not exist')
  })
})
