describe('app storage', () => {
  const DEFAULT_ENV = process.env

  let blobServiceClient
  let defaultAzureCredential

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/identity')
    jest.mock('@azure/storage-blob')

    blobServiceClient = require('@azure/storage-blob').BlobServiceClient
    defaultAzureCredential = require('@azure/identity').DefaultAzureCredential

    process.env = { ...DEFAULT_ENV }
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('should use DefaultAzureCredential if useConnectionString false', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'false'

    require('../../../../app/storage')

    expect(blobServiceClient).toHaveBeenCalledTimes(1)
    expect(defaultAzureCredential).toHaveBeenCalledTimes(1)
    expect(blobServiceClient.fromConnectionString).not.toHaveBeenCalled()
  })
})
