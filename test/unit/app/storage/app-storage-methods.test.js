const { Readable } = require('stream')
const { blobServiceClient, uploadInboundFile, getInboundFileDetails, getInboundFileList, downloadBlob } = require('../../../../app/storage')

describe('register blob functions', () => {
  beforeAll(async () => {
    const container = blobServiceClient.getContainerClient('uploads')
    await container.createIfNotExists()
  })

  test('should upload and download file', async () => {
    const filename = 'test.xlsx'
    const stream = new Readable()
    stream.push('test stream')
    stream.push(null)

    const uploadRes = await uploadInboundFile(stream, filename)

    expect(uploadRes).not.toBe(null)

    const detailsRes = await getInboundFileDetails(filename)
    expect(detailsRes.lastModified).not.toBe(null)
    expect(detailsRes.contentLength).toBe(11)

    const listRes = await getInboundFileList()
    expect(listRes.lastModified).not.toBe(null)
    expect(listRes).toEqual(['default.txt', filename])

    const downloadRes = await downloadBlob(filename)
    expect(downloadRes).toBeDefined()
    expect(downloadRes.toString()).toEqual('test stream')
  })
})
