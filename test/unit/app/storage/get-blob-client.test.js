describe('storage', () => {
  const DEFAULT_ENV = process.env

  let blobServiceClient
  let defaultAzureCredential

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/storage-blob')
    jest.mock('@azure/identity')

    blobServiceClient = require('@azure/storage-blob').BlobServiceClient
    defaultAzureCredential = require('@azure/identity').DefaultAzureCredential

    process.env = { ...DEFAULT_ENV }
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('should use connection string if useConnectionString true', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'true'

    require('../../../../app/storage/get-blob-client')

    expect(blobServiceClient.fromConnectionString).toHaveBeenCalledTimes(1)
  })

  test('should use DefaultAzureCredential if useConnectionString false', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'false'

    require('../../../../app/storage/get-blob-client')

    expect(blobServiceClient).toHaveBeenCalledTimes(1)
    expect(defaultAzureCredential).toHaveBeenCalledTimes(1)
    expect(blobServiceClient.fromConnectionString).not.toHaveBeenCalled()
  })

  test('should fail validation if invalid', () => {
    process.env.AZURE_STORAGE_ACCOUNT_NAME = undefined
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = undefined
    expect(() => require('../../../../app/storage')).toThrow('The blob storage config is invalid. "storageAccount" is required')
  })
})
