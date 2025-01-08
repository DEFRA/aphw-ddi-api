const { blobServiceClient } = require('../../../../app/storage/get-blob-client')
jest.mock('../../../../app/storage/get-blob-client')

const getMockAsyncIteratorNoLiveFiles = () => {
  return (async function * () {
    yield { segment: { blobItems: [{ name: 'file1.draft.pdf' }, { name: 'file2.draft.pdf' }] } }
    yield { segment: { bad: [{ name: 'fileBad.draft.pdf' }] } }
    yield { segment: { blobItems: [{ name: 'file3.draft.pdf' }, { name: 'file4.draft.pdf' }, { name: 'file5.draft.pdf' }] } }
  })()
}

const getMockAsyncIteratorOneLiveFile = () => {
  return (async function * () {
    yield { segment: { blobItems: [{ name: 'file11.draft.pdf' }, { name: 'file12.pdf' }] } }
    yield { segment: { bad: [{ name: 'fileBad.draft.pdf' }] } }
    yield { segment: { blobItems: [{ name: 'file13.draft.pdf' }, { name: 'file14.draft.pdf' }, { name: 'file15.draft.pdf' }] } }
  })()
}

const getMockAsyncIteratorTwoLiveFiles = () => {
  return (async function * () {
    yield { segment: { blobItems: [{ name: 'file21.draft.pdf' }, { name: 'file22.pdf' }] } }
    yield { segment: { bad: [{ name: 'fileBad' }] } }
    yield { segment: { blobItems: [{ name: 'file23.pdf' }, { name: 'file24.draft.pdf' }, { name: 'file25.draft.pdf' }] } }
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
        listBlobsFlat: jest.fn().mockReturnValue({
          byPage: getMockAsyncIteratorNoLiveFiles
        })
      })
      await expect(getLiveTemplate('send-application-pack')).rejects.toThrow('No live template for send-application-pack')
    })

    test('should return one file', async () => {
      blobServiceClient.getContainerClient.mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockResolvedValue({}),
        listBlobsFlat: jest.fn().mockReturnValue({
          byPage: getMockAsyncIteratorOneLiveFile
        })
      })
      const res = await getLiveTemplate('send-application-pack')
      expect(res).toEqual('file12.pdf')
    })

    test('should return first of two files', async () => {
      blobServiceClient.getContainerClient.mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockResolvedValue({}),
        listBlobsFlat: jest.fn().mockReturnValue({
          byPage: getMockAsyncIteratorTwoLiveFiles
        })
      })
      const res = await getLiveTemplate('send-application-pack')
      expect(res).toEqual('file22.pdf')
    })
  })
})
