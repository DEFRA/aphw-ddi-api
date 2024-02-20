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
  const inboundClient = container.getBlockBlobClient(`${config.inboundFolder}/default.txt`)
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  foldersInitialised = true
  console.log('Folders ready')
}

const downloadBlob = async (folder, filename) => {
  containersInitialised ?? await initialiseContainers()
  return await container.getBlockBlobClient(`${folder}/${filename}`).downloadToBuffer()
}

const getBlob = async (folder, filename) => {
  containersInitialised ?? await initialiseContainers()
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

const getInboundFileList = async () => {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of container.listBlobsFlat({ prefix: config.inboundFolder })) {
    if (!file.name.endsWith('/default.txt') && !file.name.endsWith('/')) {
      fileList.push(file.name.replace(`${config.inboundFolder}/`, ''))
    }
  }

  return fileList
}

const getInboundFileDetails = async (filename) => {
  const blob = await getBlob(config.inboundFolder, filename)
  return blob.getProperties()
}

const uploadInboundFile = async (stream, filename) => {
  containersInitialised ?? await initialiseContainers()
  const blockBlobClient = await getBlob(config.inboundFolder, filename)
  await blockBlobClient.uploadStream(stream,
    uploadOptions.bufferSize, uploadOptions.maxBuffers)

  return blockBlobClient
}

const uploadOvernightFile = async (stream, filename) => {
  containersInitialised ?? await initialiseContainers()
  const container = blobServiceClient.getContainerClient(config.certificateContainer)
  await container.createIfNotExists()
  const blockBlobClient = container.getBlockBlobClient(filename)
  await blockBlobClient.uploadStream(stream,
    uploadOptions.bufferSize, uploadOptions.maxBuffers)

  return blockBlobClient
}

module.exports = {
  downloadBlob,
  getInboundFileList,
  getInboundFileDetails,
  blobServiceClient,
  uploadInboundFile,
  uploadOvernightFile
}
