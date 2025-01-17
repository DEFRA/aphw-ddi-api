const { blobServiceClient } = require('../../../../app/storage/get-blob-client')
jest.mock('../../../../app/storage/get-blob-client')

const getMockAsyncIteratorNoLiveFiles = () => {
  return (async function * () {
    yield { name: 'folder/file1.draft.pdf' }
    yield { name: 'folder/file2.draft.pdf' }
    yield { name: 'fileBad' }
    yield { name: 'folder/file3.draft.pdf' }
    yield { name: 'folder/file4.draft.pdf' }
    yield { name: 'folder/file5.draft.pdf' }
    yield { name: '/tempfile5.draft.pdf' }
  })()
}

const getMockAsyncIteratorOneLiveFile = () => {
  return (async function * () {
    yield { name: 'folder/file11.draft.pdf' }
    yield { name: 'folder/file12.pdf' }
    yield { name: 'fileBad.draft.pdf' }
    yield { name: 'folder/file13.draft.pdf' }
    yield { name: 'folder/file14.draft.pdf' }
    yield { name: '/tempfile6.draft.pdf' }
    yield { name: 'folder/file15.draft.pdf' }
  })()
}

const getMockAsyncIteratorTwoLiveFiles = () => {
  return (async function * () {
    yield { name: 'folder/file21.draft.pdf' }
    yield { name: 'folder/file22.pdf' }
    yield { name: 'fileBad' }
    yield { name: 'folder/file23.pdf' }
    yield { name: 'folder/file24.draft.pdf' }
    yield { name: 'folder/file25.draft.pdf' }
  })()
}

const { getLiveTemplate } = require('../../../../app/storage/utilities')

describe('storage utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLiveTemplate', () => {
    test('should throw if no live files', async () => {
      blobServiceClient.getContainerClient.mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockResolvedValue({}),
        listBlobsByHierarchy: getMockAsyncIteratorNoLiveFiles
      })
      await expect(getLiveTemplate('folder')).rejects.toThrow('No live template for folder')
    })

    test('should return one file', async () => {
      blobServiceClient.getContainerClient.mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockResolvedValue({}),
        listBlobsByHierarchy: getMockAsyncIteratorOneLiveFile
      })
      const res = await getLiveTemplate('folder')
      expect(res).toEqual('folder/file12.pdf')
    })

    test('should return first of two files', async () => {
      blobServiceClient.getContainerClient.mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockResolvedValue({}),
        listBlobsByHierarchy: getMockAsyncIteratorTwoLiveFiles
      })
      const res = await getLiveTemplate('folder')
      expect(res).toEqual('folder/file22.pdf')
    })
  })
})
