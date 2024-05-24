describe('app storage', () => {
  const DEFAULT_ENV = process.env

  let blobServiceClient

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/identity')
    jest.mock('@azure/storage-blob', () => ({
      ...jest.requireActual('@azure/storage-blob'),
      BlobServiceClient: {
        fromConnectionString: jest.fn().mockReturnValue({
          getContainerClient: jest.fn().mockReturnValue()
        })
      }
    }))

    blobServiceClient = require('@azure/storage-blob').BlobServiceClient

    process.env = { ...DEFAULT_ENV }
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('should use connection string if useConnectionString true', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'true'

    require('../../../../app/storage')

    expect(blobServiceClient.fromConnectionString).toHaveBeenCalledTimes(1)
  })
})
