const { expectDate } = require('../../../time-helper')
const { mockValidate } = require('../../../mocks/auth')
const { portalHeader } = require('../../../mocks/jwt')

describe('Jobs endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  jest.mock('../../../../app/overnight/purge-soft-deleted-records')
  const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')

  jest.mock('../../../../app/overnight/expired-insurance')
  const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../../../../app/overnight/expired-insurance')

  jest.mock('../../../../app/overnight/expired-neutering-deadline')
  const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../../../../app/overnight/expired-neutering-deadline')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('POST /jobs/purge-soft-delete', () => {
    test('should POST /jobs/purge-soft-delete route and return 200', async () => {
      const expectedDto = {
        count: {
          success: {
            dogs: 2,
            owners: 1,
            total: 3
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: ['ED100001', 'ED100002'],
            owners: ['P-1234-56']
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      }
      purgeSoftDeletedRecords.mockResolvedValue({
        ...expectedDto,
        toString: jest.fn()
      })

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(purgeSoftDeletedRecords.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('should POST /jobs/purge-soft-delete?today=2024-03-16', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({
        count: {
          success: {
            dogs: 0,
            owners: 0,
            total: 0
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: [],
            owners: []
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      })

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(purgeSoftDeletedRecords).toHaveBeenCalledWith(new Date('2024-03-16'))
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 500 with invalid response', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({})

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /jobs/expired-insurance', () => {
    test('POST /jobs/expired-insurance should return 200', async () => {
      const expectedDto = {
        response: 'Success Insurance Expiry add reason - updated 3 rowsSuccess Insurance Expiry to breach - updated 5 rows'
      }
      addBreachReasonToExpiredInsurance.mockResolvedValue('Success Insurance Expiry add reason - updated 3 rows')
      setExpiredInsuranceToBreach.mockResolvedValue('Success Insurance Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(setExpiredInsuranceToBreach.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('should POST /jobs/expired-insurance?today=2024-03-16', async () => {
      addBreachReasonToExpiredInsurance.mockResolvedValue('Success Insurance Expiry add reason - updated 3 rows')
      setExpiredInsuranceToBreach.mockResolvedValue('Success Insurance Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(setExpiredInsuranceToBreach.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
      expect(addBreachReasonToExpiredInsurance.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /jobs/neutering-deadline', () => {
    test('POST /jobs/neutering-deadline should return 200', async () => {
      const expectedDto = {
        response: 'Success Neutering Expiry add reason - updated 3 rowsSuccess Neutering Expiry to breach - updated 5 rows'
      }
      addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('Success Neutering Expiry add reason - updated 3 rows')
      setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('Success Neutering Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(setExpiredNeuteringDeadlineToInBreach.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('should POST /jobs/expired-insurance?today=2024-03-16', async () => {
      addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('Success Neutering Expiry add reason - updated 3 rows')
      setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('Success Neutering Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(addBreachReasonToExpiredNeuteringDeadline.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
      expect(setExpiredNeuteringDeadlineToInBreach.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
