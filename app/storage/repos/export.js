const { blobServiceClient } = require('../get-blob-client')
const storageConfig = require('../../config/storage')
const ONE_MEGABYTE = 1024 * 1024
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 }

const uploadExportedFile = async (stream, filename) => {
  const container = blobServiceClient.getContainerClient(storageConfig.certificateContainer)
  await container.createIfNotExists()
  const blockBlobClient = container.getBlockBlobClient(filename)
  await blockBlobClient.uploadStream(stream,
    uploadOptions.bufferSize, uploadOptions.maxBuffers)

  return blockBlobClient
}

module.exports = {
  uploadExportedFile
}
