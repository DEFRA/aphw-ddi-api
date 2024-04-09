const { blobServiceClient } = require('../storage')
const storageConfig = require('../config/storage')

const readExportFile = async () => {
  const container = blobServiceClient.getContainerClient(`${storageConfig.certificateContainer}`)
  const filename = 'daily_export.csv'

  const blobClient = container.getBlockBlobClient(filename)

  const exists = await blobClient.exists()

  if (!exists) {
    console.log(`Read export file: File ${filename} does not exist`)
    throw new Error(`File ${filename} does not exist`)
  }

  const buffer = await blobClient.downloadToBuffer()

  return buffer.toString()
}

module.exports = {
  readExportFile
}
