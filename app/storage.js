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

const uploadsContainer = blobServiceClient.getContainerClient(config.uploadsContainer)
const attachmentsContainer = blobServiceClient.getContainerClient(config.attachmentsContainer)

const initialiseContainers = async () => {
  console.log('InitialiseCOntainers', config.createContainers)
  if (config.createContainers) {
    console.log('Making sure blob containers exist')
    await uploadsContainer.createIfNotExists()
    await attachmentsContainer.createIfNotExists()
    console.log('Containers ready')
  }
  foldersInitialised ?? await initialiseFolders()
  containersInitialised = true
}

const initialiseFolders = async () => {
  console.log('Making sure folders exist')
  const placeHolderText = 'Placeholder'
  const inboundClient = uploadsContainer.getBlockBlobClient('default.txt')
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  foldersInitialised = true
  console.log('Folders ready')
}

const getContainer = (containerName) => {
  return containerName === config.uploadsContainer ? uploadsContainer : attachmentsContainer
}

const downloadBlob = async (filename, containerName = config.uploadsContainer) => {
  containersInitialised ?? await initialiseContainers()
  return await getContainer(containerName).getBlockBlobClient(filename).downloadToBuffer()
}

const getBlob = async (filename, containerName = config.uploadsContainer) => {
  containersInitialised ?? await initialiseContainers()
  return getContainer(containerName).getBlockBlobClient(filename)
}

const getInboundFileList = async (containerName = config.uploadsContainer) => {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of getContainer(containerName).listBlobsFlat()) {
    if (!file.name.endsWith('/default.txt')) {
      fileList.push(file.name)
    }
  }

  return fileList
}

const getInboundFileDetails = async (filename, containerName = config.uploadsContainer) => {
  const blob = await getBlob(filename, containerName)
  return blob.getProperties()
}

const uploadInboundFile = async (stream, filename, containerName = config.uploadsContainer) => {
  containersInitialised ?? await initialiseContainers()
  const blockBlobClient = await getBlob(filename, containerName)
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
