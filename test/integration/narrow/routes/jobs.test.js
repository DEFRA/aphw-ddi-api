const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')
describe('Jobs endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/overnight/purge-soft-deleted-records')
  const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('POST /jobs/purge-soft-delete', () => {
    test('POST /jobs/purge-soft-delete route returns 200', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({
        count: {
          dogs: 2,
          owners: 1,
          total: 3
        },
        deleted: {
          dogs: ['ED100001', 'ED100002'],
          owners: ['P-1234-56']
        }
      })

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete'
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(purgeSoftDeletedRecords).toHaveBeenCalled()
      expect(responseData).toEqual({
        count: {
          dogs: 2,
          owners: 1,
          total: 3
        },
        deleted: {
          dogs: ['ED100001', 'ED100002'],
          owners: ['P-1234-56']
        }
      })
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
