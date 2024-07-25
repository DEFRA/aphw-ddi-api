const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('./config/storage')
let blobServiceClient
let containersInitialised
let foldersInitialised

const ONE_MEGABYTE = 1024 * 1024
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 }

if (config.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient storage.js')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
  console.log('client connected ok')
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential())
}

const container = blobServiceClient.getContainerClient(config.container)

const initialiseContainers = async () => {
  if (config.createContainers) {
    console.log('Making sure blob containers exist')
    await container.createIfNotExists()
    console.log('Containers ready')
  }
  foldersInitialised ?? await initialiseFolders()
  containersInitialised = true
}

const initialiseFolders = async () => {
  console.log('Making sure folders exist')
  const placeHolderText = 'Placeholder'
  const inboundClient = container.getBlockBlobClient('default.txt')
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  foldersInitialised = true
  console.log('Folders ready')
}

const downloadBlob = async (filename) => {
  containersInitialised ?? await initialiseContainers()
  return await container.getBlockBlobClient(filename).downloadToBuffer()
}

const getBlob = async (filename) => {
  containersInitialised ?? await initialiseContainers()
  return container.getBlockBlobClient(filename)
}

const getInboundFileList = async () => {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of container.listBlobsFlat()) {
    if (!file.name.endsWith('/default.txt')) {
      fileList.push(file.name)
    }
  }

  return fileList
}

const getInboundFileDetails = async (filename) => {
  const blob = await getBlob(filename)
  return blob.getProperties()
}

const uploadInboundFile = async (stream, filename) => {
  containersInitialised ?? await initialiseContainers()
  const blockBlobClient = await getBlob(filename)
  await blockBlobClient.uploadStream(stream,
    uploadOptions.bufferSize, uploadOptions.maxBuffers)

  return blockBlobClient
}

module.exports = {
  downloadBlob,
  getInboundFileList,
  getInboundFileDetails,
  blobServiceClient,
  uploadInboundFile
}
