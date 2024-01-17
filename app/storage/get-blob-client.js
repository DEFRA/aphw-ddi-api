const { BlobServiceClient } = require('@azure/storage-blob')
const { DefaultAzureCredential } = require('@azure/identity')
const storageConfig = require('../config/storage')

let blobServiceClient

if (storageConfig.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient')
  console.log(storageConfig.connectionStr)
  blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${storageConfig.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential())
}

module.exports = {
  blobServiceClient
}
