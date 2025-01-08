const { blobServiceClient } = require('./get-blob-client')
const storageConfig = require('../config/storage')

const maxPageSize = 100

const listOptions = {
  includeMetadata: false,
  includeSnapshots: false
}

const getLiveTemplate = async (emailType) => {
  const container = blobServiceClient.getContainerClient(storageConfig.attachmentsContainer)

  await container.createIfNotExists()

  const files = []
  for await (const response of container.listBlobsFlat(listOptions).byPage({ maxPageSize })) {
    if (response.segment.blobItems) {
      for (const blob of response.segment.blobItems) {
        const filename = blob.name
        if (!filename.endsWith('.draft.pdf') && filename.endsWith('.pdf') && filename.indexOf('/') === -1) {
          files.push(filename)
        }
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
