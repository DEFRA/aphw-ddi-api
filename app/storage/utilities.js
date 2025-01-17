const { blobServiceClient } = require('./get-blob-client')
const storageConfig = require('../config/storage')

const getLiveTemplate = async (emailType) => {
  const container = blobServiceClient.getContainerClient(storageConfig.attachmentsContainer)

  await container.createIfNotExists()

  const files = []
  for await (const item of container.listBlobsByHierarchy('/', { prefix: `${emailType}/` })) {
    const filename = item.name
    if (filename.startsWith(`${emailType}/`)) {
      if (!filename.endsWith('.draft.pdf') && filename.endsWith('.pdf')) {
        files.push(filename)
      }
    }
  }

  if (files.length === 0) {
    throw new Error(`No live template for ${emailType}`)
  }

  return files[0]
}

module.exports = {
  getLiveTemplate
}
