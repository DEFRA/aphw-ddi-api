const { expectDate } = require('../../../time-helper')

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
    test('should POST /jobs/purge-soft-delete route and return 200', async () => {
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
      expectDate(purgeSoftDeletedRecords.mock.calls[0][0]).toBeNow()
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

    test('should POST /jobs/purge-soft-delete?today=2024-03-16', async () => {
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
        url: '/jobs/purge-soft-delete?today=2024-03-16'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(purgeSoftDeletedRecords).toHaveBeenCalledWith(new Date('2024-03-16'))
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete?unknown=true'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 500 with invalid response', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({})

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
