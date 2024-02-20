describe('overnight', () => {
  const storageConfig = require('../../../../../app/config/storage')
  const { blobServiceClient } = require('../../../../../app/storage/get-blob-client')
  const { uploadExportedFile } = require('../../../../../app/storage/repos/export')

  beforeAll(async () => {
    const container = blobServiceClient.getContainerClient(storageConfig.certificateContainer)

    await container.createIfNotExists()
  })

  test('should upload overnight file', async () => {
    const exportedData = '12345'
    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadExportedFile(str, 'daily_export.csv')

    const container = blobServiceClient.getContainerClient(storageConfig.certificateContainer)
    const blobClient = container.getBlockBlobClient('daily_export.csv')

    const exists = await blobClient.exists()

    expect(exists).toEqual(true)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await blobServiceClient.deleteContainer(storageConfig.certificateContainer)
  })
})
