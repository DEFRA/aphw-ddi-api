const { blobServiceClient } = require('../get-blob-client')
const storageConfig = require('../../config/storage')

const uploadCertificate = async (indexNumber, certificateId, buffer) => {
  const container = blobServiceClient.getContainerClient(storageConfig.certificateContainer)

  await container.createIfNotExists()

  const blobClient = container.getBlockBlobClient(`${indexNumber}/${certificateId}.pdf`)

  await blobClient.uploadData(buffer)
}

module.exports = {
  uploadCertificate
}
