const { payload: mockCreatePayload, payloadWithPersonReference: mockCreateWithRefPayload } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { CdoTaskList } = require('../../../../app/data/domain')
const { buildCdo, buildCdoDog } = require('../../../mocks/cdo/domain')
const { ActionAlreadyPerformedError } = require('../../../../app/errors/domain/actionAlreadyPerformed')
const { devUser } = require('../../../mocks/auth')
const { SequenceViolationError } = require('../../../../app/errors/domain/sequenceViolation')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { InvalidDataError } = require('../../../../app/errors/domain/invalidData')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const cdoRepository = require('../../../../app/repos/cdo')
  const { createCdo, getCdo } = cdoRepository

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/service/config')
  const { getCdoService } = require('../../../../app/service/config')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    getCallingUser.mockReturnValue(devUser)
    await server.initialize()
  })

  describe('GET /cdo/ED123', () => {
    test('GET /cdo/ED123 route returns 200', async () => {
      getCdo.mockResolvedValue({
        id: 123,
        indexNumber: 'ED123',
        dog_breed: {
          breed: 'breed1'
        },
        status: {
          status: 'NEW'
        },
        registration: {
          court: {
            name: 'court1'
          },
          police_force: {
            name: 'force1'
          },
          exemption_order: {
            exemption_order: 2015
          }
        },
        registered_person: [{
          person: {
          }
        }]
      })

      const options = {
        method: 'GET',
        url: '/cdo/ED123'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /cdo/ED123 route returns 404 when not found', async () => {
      getCdo.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/cdo/ED123'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /cdo/ED123 route returns 500 when error', async () => {
      getCdo.mockImplementation(() => { throw new Error('cdo error') })

      const options = {
        method: 'GET',
        url: '/cdo/ED123'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo', () => {
    test('POST /cdo route returns 200 with valid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreatePayload
      }

      createCdo.mockResolvedValue({
        owner: {
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          address: {
            address_line_1: '1 Test Street',
            address_line_2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: {
              country: 'England'
            }
          },
          person_reference: '1234'
        },
        dogs: [
          {
            index_number: 'ED10000',
            name: 'Test Dog',
            dog_breed: {
              breed: 'Test Breed'
            },
            registration: {
              police_force: {
                name: 'Test Police Force'
              },
              court: {
                name: 'Test Court'
              },
              cdo_issued: '2020-01-01',
              cdo_expiry: '2020-02-01',
              legislation_officer: 'Test Officer'
            }
          }
        ]
      })

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({
        owner: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          address: {
            addressLine1: '1 Test Street',
            addressLine2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: 'England'
          },
          personReference: '1234'
        },
        enforcementDetails: {
          policeForce: 'Test Police Force',
          court: 'Test Court',
          legislationOfficer: 'Test Officer'
        },
        dogs: [
          {
            indexNumber: 'ED10000',
            name: 'Test Dog',
            breed: 'Test Breed',
            cdoIssued: '2020-01-01',
            cdoExpiry: '2020-02-01'
          }
        ]
      })
    })

    test('POST /cdo route returns 200 with valid payload and personReference', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreateWithRefPayload
      }

      createCdo.mockResolvedValue({
        owner: {
          first_name: 'John',
          last_name: 'Doe',
          birth_date: '1990-01-01',
          address: {
            address_line_1: '1 Test Street',
            address_line_2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: {
              country: 'England'
            }
          },
          person_reference: 'P-6076-A37C'
        },
        dogs: [
          {
            index_number: 'ED10000',
            name: 'Test Dog',
            dog_breed: {
              breed: 'Test Breed'
            },
            registration: {
              police_force: {
                name: 'Test Police Force'
              },
              court: {
                name: 'Test Court'
              },
              cdo_issued: '2020-01-01',
              cdo_expiry: '2020-02-01',
              legislation_officer: 'Test Officer'
            }
          }
        ]
      })

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({
        owner: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          address: {
            addressLine1: '1 Test Street',
            addressLine2: 'Test',
            town: 'Test',
            postcode: 'TE1 1ST',
            country: 'England'
          },
          personReference: 'P-6076-A37C'
        },
        enforcementDetails: {
          policeForce: 'Test Police Force',
          court: 'Test Court',
          legislationOfficer: 'Test Officer'
        },
        dogs: [
          {
            indexNumber: 'ED10000',
            name: 'Test Dog',
            breed: 'Test Breed',
            cdoIssued: '2020-01-01',
            cdoExpiry: '2020-02-01'
          }
        ]
      })
    })

    test('POST /cdo route returns 422 with invalid personReference', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreateWithRefPayload
      }

      createCdo.mockRejectedValue(new NotFoundError('Owner not found'))

      const response = await server.inject(options)

      expect(response.statusCode).toBe(422)
    })

    test('POST /cdo route returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: {}
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('POST /cdo route returns 500 if db error', async () => {
      createCdo.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreatePayload
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /cdo/ED123/manage', () => {
    test('should return an initialised manage cdo task list', async () => {
      const cdoTaskList = new CdoTaskList(buildCdo())
      cdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      const getTaskListMock = jest.fn((indexNumber) => cdoTaskList)
      getCdoService.mockReturnValue({
        getTaskList: getTaskListMock
      })
      const options = {
        method: 'GET',
        url: '/cdo/ED123/manage'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(getTaskListMock).toHaveBeenCalledWith('ED123')
      expect(payload).toEqual({
        tasks: {
          applicationPackSent: {
            key: 'applicationPackSent',
            available: true,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          insuranceDetailsRecorded: {
            key: 'insuranceDetailsRecorded',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          microchipNumberRecorded: {
            key: 'microchipNumberRecorded',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          applicationFeePaid: {
            key: 'applicationFeePaid',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          form2Sent: {
            key: 'form2Sent',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          verificationDateRecorded: {
            key: 'verificationDateRecorded',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          certificateIssued: {
            key: 'certificateIssued',
            available: false,
            completed: false,
            readonly: false,
            timestamp: undefined
          }
        }
      })
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        getTaskList: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'GET',
        url: '/cdo/ED123/manage'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        getTaskList: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'GET',
        url: '/cdo/ED123/manage'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:sendApplicationPack', () => {
    test('should return 204', async () => {
      const sendApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        sendApplicationPack: sendApplicationPackMock
      })
      sendApplicationPackMock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendApplicationPack'
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(sendApplicationPackMock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        sendApplicationPack: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendApplicationPack'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action already performed', async () => {
      getCdoService.mockReturnValue({
        sendApplicationPack: async () => {
          throw new ActionAlreadyPerformedError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendApplicationPack'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        sendApplicationPack: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendApplicationPack'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:recordInsuranceDetails', () => {
    test('should return 201', async () => {
      const insuranceRenewal = new Date('9999-01-01')
      const recordInsuranceDetailsMock = jest.fn()
      getCdoService.mockReturnValue({
        recordInsuranceDetails: recordInsuranceDetailsMock
      })
      recordInsuranceDetailsMock.mockResolvedValue({
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '9999-01-01'
        }
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: '9999-01-01T00:00:00.000Z'
      })
      expect(recordInsuranceDetailsMock).toHaveBeenCalledWith(
        'ED123',
        {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: new Date('9999-01-01')
        },
        devUser)
    })

    test('should returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {}
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        recordInsuranceDetails: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '2024-01-01'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        recordInsuranceDetails: async () => {
          throw new SequenceViolationError('Application pack must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '2024-01-01'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        recordInsuranceDetails: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '2024-01-01'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:recordMicrochipNumber', () => {
    test('should return 201', async () => {
      const recordMicrochipNumberMock = jest.fn()
      getCdoService.mockReturnValue({
        recordMicrochipNumber: recordMicrochipNumberMock
      })
      recordMicrochipNumberMock.mockResolvedValue(new CdoTaskList(buildCdo({
        dog: buildCdoDog({
          microchipNumber: '123456789012345'
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        }
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        microchipNumber: '123456789012345'
      })
      expect(recordMicrochipNumberMock).toHaveBeenCalledWith(
        'ED123',
        {
          microchipNumber: '123456789012345'
        },
        devUser)
    })

    test('should returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {}
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
    test('should returns 400 with invalid microchip', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new InvalidDataError('microchip invalid')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '1234567890123a5'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new SequenceViolationError('Application pack must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should throw a 409 given duplicate microchip', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new DuplicateResourceError('The microchip number already exists', { microchipNumbers: ['123456789012345'] })
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })
})
