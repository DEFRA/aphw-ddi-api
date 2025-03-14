const { payload: mockCreatePayload, payloadWithPersonReference: mockCreateWithRefPayload } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { CdoTaskList, Address } = require('../../../../app/data/domain')
const { buildCdo, buildCdoDog, buildExemption, buildCdoInsurance, buildCdoPerson, buildCdoPersonContactDetails } = require('../../../mocks/cdo/domain')
const { ActionAlreadyPerformedError } = require('../../../../app/errors/domain/actionAlreadyPerformed')
const { devUser, mockValidate, mockValidateEnforcement } = require('../../../mocks/auth')
const { SequenceViolationError } = require('../../../../app/errors/domain/sequenceViolation')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { InvalidDataError } = require('../../../../app/errors/domain/invalidData')
const { InvalidDateError } = require('../../../../app/errors/domain/invalidDate')
const { buildCdoDao } = require('../../../mocks/cdo/get')
const { portalHeader, enforcementHeader } = require('../../../mocks/jwt')

describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/cdo')
  const cdoRepository = require('../../../../app/repos/cdo')
  const { createCdo, getCdo } = cdoRepository

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/service/config')
  const { getCdoService } = require('../../../../app/service/config')

  jest.mock('../../../../app/dto/auditing/view')
  const { auditDogDetailsView, auditDogActivityView, auditDogCdoProgressView } = require('../../../../app/dto/auditing/view')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    getCallingUser.mockReturnValue(devUser)
    await server.initialize()
  })

  describe('GET /cdo/ED123', () => {
    test('GET /cdo/ED123 route returns 200', async () => {
      const cdoDao = buildCdoDao({
        id: 123,
        index_number: 'ED123'
      })
      getCdo.mockResolvedValue(cdoDao)

      const options = {
        method: 'GET',
        url: '/cdo/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)

      expect(auditDogDetailsView).toHaveBeenCalledWith(cdoDao, expect.objectContaining({
        username: 'dev-user@test.com',
        displayname: 'Dev User'
      }))
    })

    test('GET /cdo/ED123?type=activity route returns 200', async () => {
      const cdoDao = buildCdoDao({
        id: 123,
        index_number: 'ED123'
      })
      getCdo.mockResolvedValue(cdoDao)

      const options = {
        method: 'GET',
        url: '/cdo/ED123?type=activity',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)

      expect(auditDogActivityView).toHaveBeenCalledWith(cdoDao, expect.objectContaining({
        username: 'dev-user@test.com',
        displayname: 'Dev User'
      }))
    })

    test('GET /cdo/ED123 route returns 404 when not found', async () => {
      getCdo.mockResolvedValue(null)

      const options = {
        method: 'GET',
        url: '/cdo/ED123',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('GET /cdo/ED123 route returns 500 when error', async () => {
      getCdo.mockImplementation(() => { throw new Error('cdo error') })

      const options = {
        method: 'GET',
        url: '/cdo/ED123',
        ...portalHeader
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
        payload: mockCreatePayload,
        ...portalHeader
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
            status: {
              status: 'Interim exempt'
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
            status: 'Interim exempt',
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
        payload: mockCreateWithRefPayload,
        ...portalHeader
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
            status: { status: 'Interim exempt' },
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
            status: 'Interim exempt',
            cdoExpiry: '2020-02-01'
          }
        ]
      })
    })

    test('POST /cdo route returns 422 with invalid personReference', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreateWithRefPayload,
        ...portalHeader
      }

      createCdo.mockRejectedValue(new NotFoundError('Owner not found'))

      const response = await server.inject(options)

      expect(response.statusCode).toBe(422)
    })

    test('POST /cdo route returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('POST /cdo route returns 500 if db error', async () => {
      createCdo.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreatePayload,
        ...portalHeader
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })

    test('POST /cdo route returns 403 with enforcement call', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      const options = {
        method: 'POST',
        url: '/cdo',
        payload: mockCreatePayload,
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })
  })

  describe('GET /cdo/ED123/manage', () => {
    test('should return an initialised manage cdo task list', async () => {
      const cdoTaskList = new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          contactDetails: buildCdoPersonContactDetails({
            email: 'alex@carter.co.uk'
          })
        })
      }))
      cdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      const getTaskListMock = jest.fn(_ => cdoTaskList)
      getCdoService.mockReturnValue({
        getTaskList: getTaskListMock
      })
      const options = {
        method: 'GET',
        url: '/cdo/ED300097/manage',
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(getTaskListMock).toHaveBeenCalledWith('ED300097')
      expect(payload).toEqual({
        indexNumber: 'ED300097',
        verificationOptions: {
          dogDeclaredUnfit: expect.any(Boolean),
          neuteringBypassedUnder16: expect.any(Boolean),
          allowDogDeclaredUnfit: expect.any(Boolean),
          allowNeuteringBypass: expect.any(Boolean),
          showNeuteringBypass: expect.any(Boolean)
        },
        tasks: {
          applicationPackSent: {
            key: 'applicationPackSent',
            available: true,
            completed: false,
            readonly: false,
            timestamp: undefined
          },
          applicationPackProcessed: {
            key: 'applicationPackProcessed',
            available: false,
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
        },
        cdoSummary: {
          dog: {
            name: 'Rex300'
          },
          exemption: {
            cdoExpiry: '2023-12-10T00:00:00.000Z'
          },
          person: {
            firstName: 'Alex',
            lastName: 'Carter',
            email: 'alex@carter.co.uk',
            addressLine1: '300 Anywhere St',
            addressLine2: 'Anywhere Estate',
            town: 'City of London',
            postcode: 'S1 1AA'
          }
        }
      })
    })

    test('should return an initialised manage cdo task list when called from enforcement', async () => {
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          form2Submitted: new Date('2024-12-06')
        })
      }))
      cdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      const getTaskListMock = jest.fn(_ => cdoTaskList)
      getCdoService.mockReturnValue({
        getTaskList: getTaskListMock
      })
      const options = {
        method: 'GET',
        url: '/cdo/ED123/manage',
        ...enforcementHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)

      expect(auditDogCdoProgressView).toHaveBeenCalledWith(cdoTaskList, expect.anything())
      expect(payload).toEqual(expect.objectContaining({
        form2Submitted: '2024-12-06T00:00:00.000Z'
      }))
    })

    test('should return a complete manage cdo task list', async () => {
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-06-25'),
          applicationPackProcessed: new Date('2024-06-25'),
          form2Sent: new Date('2024-05-24'),
          applicationFeePaid: new Date('2024-06-24'),
          neuteringConfirmation: new Date('2024-02-10'),
          microchipVerification: new Date('2024-03-09'),
          microchipDeadline: new Date('2024-03-09'),
          insuranceDetailsRecorded: new Date('2024-03-09'),
          insurance: [buildCdoInsurance({
            company: 'Dogs R Us',
            renewalDate: new Date('9999-10-10')
          })],
          certificateIssued: new Date('2024-06-27')
        }),
        dog: buildCdoDog({
          id: '123',
          indexNumber: 'ED123',
          microchipNumber: '123456789012345',
          microchipNumber2: '123456789012345'
        })
      }))
      cdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      const getTaskListMock = jest.fn(_ => cdoTaskList)
      getCdoService.mockReturnValue({
        getTaskList: getTaskListMock
      })
      const options = {
        method: 'GET',
        url: '/cdo/ED123/manage',
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(getTaskListMock).toHaveBeenCalledWith('ED123')
      expect(payload).toEqual({
        indexNumber: 'ED123',
        verificationOptions: {
          dogDeclaredUnfit: expect.any(Boolean),
          neuteringBypassedUnder16: expect.any(Boolean),
          allowDogDeclaredUnfit: expect.any(Boolean),
          allowNeuteringBypass: expect.any(Boolean),
          showNeuteringBypass: expect.any(Boolean)
        },
        tasks: {
          applicationPackSent: {
            key: 'applicationPackSent',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-06-25T00:00:00.000Z'
          },
          applicationPackProcessed: {
            key: 'applicationPackProcessed',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-06-25T00:00:00.000Z'
          },
          insuranceDetailsRecorded: {
            key: 'insuranceDetailsRecorded',
            available: true,
            completed: true,
            readonly: false,
            timestamp: '2024-03-09T00:00:00.000Z'
          },
          microchipNumberRecorded: {
            key: 'microchipNumberRecorded',
            available: true,
            completed: true,
            readonly: false,
            timestamp: null
          },
          applicationFeePaid: {
            key: 'applicationFeePaid',
            available: true,
            completed: true,
            readonly: false,
            timestamp: '2024-06-24T00:00:00.000Z'
          },
          form2Sent: {
            key: 'form2Sent',
            available: true,
            completed: true,
            readonly: true,
            timestamp: '2024-05-24T00:00:00.000Z'
          },
          verificationDateRecorded: {
            key: 'verificationDateRecorded',
            available: true,
            completed: true,
            readonly: false,
            timestamp: null
          },
          certificateIssued: {
            key: 'certificateIssued',
            available: false,
            completed: true,
            readonly: false,
            timestamp: '2024-06-27T00:00:00.000Z'
          }
        },
        applicationFeePaid: '2024-06-24T00:00:00.000Z',
        applicationPackSent: '2024-06-25T00:00:00.000Z',
        applicationPackProcessed: '2024-06-25T00:00:00.000Z',
        certificateIssued: '2024-06-27T00:00:00.000Z',
        form2Sent: '2024-05-24T00:00:00.000Z',
        insuranceCompany: 'Dogs R Us',
        insuranceRenewal: '9999-10-10T00:00:00.000Z',
        microchipDeadline: '2024-03-09T00:00:00.000Z',
        microchipNumber: '123456789012345',
        microchipNumber2: '123456789012345',
        microchipVerification: '2024-03-09T00:00:00.000Z',
        neuteringConfirmation: '2024-02-10T00:00:00.000Z',
        cdoSummary: {
          dog: {
            name: 'Rex300'
          },
          exemption: {
            cdoExpiry: '2023-12-10T00:00:00.000Z'
          },
          person: {
            firstName: 'Alex',
            lastName: 'Carter',
            addressLine1: '300 Anywhere St',
            addressLine2: 'Anywhere Estate',
            postcode: 'S1 1AA',
            town: 'City of London'
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
        url: '/cdo/ED123/manage',
        ...portalHeader
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
        url: '/cdo/ED123/manage',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:emailApplicationPack', () => {
    test('should return 200', async () => {
      const emailApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        emailApplicationPack: emailApplicationPackMock
      })
      emailApplicationPackMock.mockResolvedValue(new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          firstName: 'Garry',
          lastName: 'McFadyen',
          contactDetails: buildCdoPersonContactDetails({
            email: 'garrymcfadyen@hotmail.com',
            address: new Address({
              addressLine1: '122 Common Road',
              addressLine2: null,
              town: 'Bexhill-on-Sea',
              postcode: 'TN39 4JB'
            })
          })
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {
          email: 'garrymcfadyen@hotmail.com'
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(emailApplicationPackMock).toHaveBeenCalledWith('ED123', 'garrymcfadyen@hotmail.com', false, expect.any(Date), devUser)
      expect(JSON.parse(response.payload)).toEqual({
        email: 'garrymcfadyen@hotmail.com'
      })
    })

    test('should return 200 and update email given email update requested', async () => {
      const emailApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        emailApplicationPack: emailApplicationPackMock
      })
      emailApplicationPackMock.mockResolvedValue(new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          firstName: 'Garry',
          lastName: 'McFadyen',
          contactDetails: buildCdoPersonContactDetails({
            email: 'garrymcfadyen@hotmail.com',
            address: new Address({
              addressLine1: '122 Common Road',
              addressLine2: null,
              town: 'Bexhill-on-Sea',
              postcode: 'TN39 4JB'
            })
          })
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {
          email: 'garrymcfadyen2@hotmail.com',
          updateEmail: true
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(emailApplicationPackMock).toHaveBeenCalledWith('ED123', 'garrymcfadyen2@hotmail.com', true, expect.any(Date), devUser)
      expect(JSON.parse(response.payload)).toEqual({
        email: 'garrymcfadyen@hotmail.com'
      })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {
          email: 'garrymcfadyen@hotmail.com'
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 400 given empty payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        emailApplicationPack: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {
          email: 'garrymcfadyen@hotmail.com'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        emailApplicationPack: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:emailApplicationPack',
        payload: {
          email: 'garrymcfadyen@hotmail.com'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:postApplicationPack', () => {
    test('should return 200', async () => {
      const postApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        postApplicationPack: postApplicationPackMock
      })
      postApplicationPackMock.mockResolvedValue(new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          firstName: 'Garry',
          lastName: 'McFadyen',
          contactDetails: buildCdoPersonContactDetails({
            email: undefined,
            address: new Address({
              addressLine1: '122 Common Road',
              addressLine2: null,
              town: 'Bexhill-on-Sea',
              postcode: 'TN39 4JB'
            })
          })
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:postApplicationPack',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(postApplicationPackMock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser)
      expect(JSON.parse(response.payload)).toEqual({
        firstName: 'Garry',
        lastName: 'McFadyen',
        addressLine1: '122 Common Road',
        addressLine2: null,
        town: 'Bexhill-on-Sea',
        postcode: 'TN39 4JB'
      })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:postApplicationPack',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        postApplicationPack: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:postApplicationPack',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        postApplicationPack: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:postApplicationPack',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:processApplicationPack', () => {
    test('should return 204', async () => {
      const processApplicationPackMock = jest.fn()
      getCdoService.mockReturnValue({
        processApplicationPack: processApplicationPackMock
      })
      processApplicationPackMock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:processApplicationPack',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(processApplicationPackMock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:processApplicationPack',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        processApplicationPack: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:processApplicationPack',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action already performed', async () => {
      getCdoService.mockReturnValue({
        processApplicationPack: async () => {
          throw new ActionAlreadyPerformedError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:processApplicationPack',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        processApplicationPack: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:processApplicationPack',
        ...portalHeader
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
      recordInsuranceDetailsMock.mockResolvedValue(new CdoTaskList(buildCdo({
        exemption: buildExemption({
          insurance: [buildCdoInsurance({
            renewalDate: insuranceRenewal,
            company: 'Dog\'s Trust'
          })]
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '9999-01-01'
        },
        ...portalHeader
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

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {
          insuranceCompany: 'Dog\'s Trust',
          insuranceRenewal: '9999-01-01'
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordInsuranceDetails',
        payload: {},
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
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

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should returns 400 with invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {},
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should throw a 409 given duplicate microchip', async () => {
      getCdoService.mockReturnValue({
        recordMicrochipNumber: async () => {
          throw new DuplicateResourceError('Microchip number already exists', { microchipNumbers: ['123456789012345'] })
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordMicrochipNumber',
        payload: {
          microchipNumber: '123456789012345'
        },
        ...portalHeader
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:recordApplicationFee', () => {
    test('should return 201', async () => {
      const recordApplicationFeeMock = jest.fn()
      const applicationFeePaidDate = new Date('2024-07-02T00:00:00.000Z')
      getCdoService.mockReturnValue({
        recordApplicationFee: recordApplicationFeeMock
      })
      recordApplicationFeeMock.mockResolvedValue(new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationFeePaid: applicationFeePaidDate
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '2024-07-02'
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        applicationFeePaid: '2024-07-02T00:00:00.000Z'
      })
      expect(recordApplicationFeeMock).toHaveBeenCalledWith(
        'ED123',
        {
          applicationFeePaid: applicationFeePaidDate
        },
        devUser)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '2024-07-02'
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 400 given invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
    test('should return 400 given invalid date', async () => {
      getCdoService.mockReturnValue({
        recordApplicationFee: async () => {
          throw new InvalidDateError('Date must be today or in the past')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '9999-07-02'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        recordApplicationFee: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '2024-07-02'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        recordApplicationFee: async () => {
          throw new SequenceViolationError('Application pack must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '2024-07-02'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        recordApplicationFee: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:recordApplicationFee',
        payload: {
          applicationFeePaid: '2024-07-02'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:sendForm2', () => {
    test('should return 204', async () => {
      const sendForm2Mock = jest.fn()
      getCdoService.mockReturnValue({
        sendForm2: sendForm2Mock
      })
      sendForm2Mock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...portalHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(sendForm2Mock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        sendForm2: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action already performed', async () => {
      getCdoService.mockReturnValue({
        sendForm2: async () => {
          throw new ActionAlreadyPerformedError('action repeated')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        sendForm2: async () => {
          throw new SequenceViolationError('Application pack must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        sendForm2: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:submitFormTwo', () => {
    beforeEach(() => {
      validate.mockResolvedValue(mockValidateEnforcement)
    })

    test('should return 204', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      const submitForm2Mock = jest.fn()
      getCdoService.mockReturnValue({
        submitFormTwo: submitForm2Mock
      })
      submitForm2Mock.mockResolvedValue(undefined)

      const expectedPayload = {
        microchipNumber: '123456789012358',
        microchipVerification: '01/10/2024',
        dogNotFitForMicrochip: false,
        microchipDeadline: '',
        neuteringConfirmation: '01/10/2024',
        dogNotNeutered: false
      }

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: '2024-10-01T00:00:00.000Z',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(submitForm2Mock).toHaveBeenCalledWith('ED123', expectedPayload, devUser)
    })

    test('should return 204 given different call', async () => {
      const submitForm2Mock = jest.fn()
      getCdoService.mockReturnValue({
        submitFormTwo: submitForm2Mock
      })
      submitForm2Mock.mockResolvedValue(undefined)

      const expectedPayload = {
        microchipNumber: '123456789012358',
        microchipVerification: '',
        dogNotFitForMicrochip: true,
        microchipDeadline: '01/10/2024',
        neuteringConfirmation: '',
        dogNotNeutered: true
      }

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: { year: '', month: '', day: '' },
          microchipDeadline: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: true,
          neuteringConfirmation: { year: '', month: '', day: '' },
          dogNotNeutered: true
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(204)
      expect(submitForm2Mock).toHaveBeenCalledWith('ED123', expectedPayload, devUser)
    })

    test('should return 400 for invalid payload', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)
      const submitForm2Mock = jest.fn()
      getCdoService.mockReturnValue({
        submitFormTwo: submitForm2Mock
      })
      submitForm2Mock.mockResolvedValue(undefined)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: 'bad-date',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 403 given call from portal', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:sendForm2',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        submitFormTwo: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: '2024-10-01T00:00:00.000Z',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action already performed', async () => {
      getCdoService.mockReturnValue({
        submitFormTwo: async () => {
          throw new ActionAlreadyPerformedError('action repeated')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: '2024-10-01T00:00:00.000Z',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        submitFormTwo: async () => {
          throw new SequenceViolationError('Application pack must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: '2024-10-01T00:00:00.000Z',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        submitFormTwo: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:submitFormTwo',
        payload: {
          microchipNumber: '123456789012358',
          microchipVerification: '2024-10-01T00:00:00.000Z',
          dogNotFitForMicrochip: false,
          neuteringConfirmation: '2024-10-01T00:00:00.000Z',
          dogNotNeutered: false
        },
        ...enforcementHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:verifyDates', () => {
    test('should return 201', async () => {
      const verifyDatesMock = jest.fn()
      const microchipVerification = new Date('2024-07-03')
      const neuteringConfirmation = new Date('2024-07-04')
      getCdoService.mockReturnValue({
        verifyDates: verifyDatesMock
      })
      verifyDatesMock.mockResolvedValue(new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationFeePaid: new Date(),
          microchipVerification,
          neuteringConfirmation
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-03',
          neuteringConfirmation: '2024-07-04'
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        microchipVerification: microchipVerification.toISOString(),
        neuteringConfirmation: neuteringConfirmation.toISOString()
      })
      expect(verifyDatesMock).toHaveBeenCalledWith('ED123', {
        dogNotNeutered: false,
        dogNotFitForMicrochip: false,
        microchipVerification,
        neuteringConfirmation
      }, devUser)
    })

    test('should return 201 given dogNotNeutered and dogNotFitForMicrochip call', async () => {
      const verifyDatesMock = jest.fn()
      const microchipVerification = undefined
      const neuteringConfirmation = undefined
      const neuteringDeadline = new Date()
      const microchipDeadlineCall = new Date('9999-10-01')
      const microchipDeadline = new Date('9999-10-29')

      neuteringDeadline.setFullYear(neuteringDeadline.getFullYear() + 1)
      getCdoService.mockReturnValue({
        verifyDates: verifyDatesMock
      })
      verifyDatesMock.mockResolvedValue(new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationFeePaid: new Date(),
          microchipVerification,
          neuteringConfirmation,
          neuteringDeadline,
          microchipDeadline
        })
      })))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipDeadline: '9999-10-01',
          dogNotNeutered: true,
          dogNotFitForMicrochip: true
        },
        ...portalHeader
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        microchipVerification: undefined,
        neuteringConfirmation: undefined,
        neuteringDeadline: neuteringDeadline.toISOString(),
        microchipDeadline: microchipDeadline.toISOString()
      })
      expect(verifyDatesMock).toHaveBeenCalledWith('ED123', {
        microchipVerification,
        neuteringConfirmation,
        microchipDeadline: microchipDeadlineCall,
        dogNotNeutered: true,
        dogNotFitForMicrochip: true
      }, devUser)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-03',
          neuteringConfirmation: '2024-07-04'
        },
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-03',
          neuteringConfirmation: '2024-07-03'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new SequenceViolationError('Form 2 must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-03',
          neuteringConfirmation: '2024-07-03'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should return 400 given invalid date', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new InvalidDateError('Date must be today or in the past')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-06',
          neuteringConfirmation: '9999-07-02'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 400 given empty payload', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new InvalidDateError('Date must be today or in the past')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {},
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:verifyDates',
        payload: {
          microchipVerification: '2024-07-03',
          neuteringConfirmation: '2024-07-03'
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /cdo/ED123/manage:issueCertificate', () => {
    test('should return 201', async () => {
      const issueCertificateMock = jest.fn()

      getCdoService.mockReturnValue({
        issueCertificate: issueCertificateMock
      })

      issueCertificateMock.mockResolvedValue(new Date('2024-07-30'))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...portalHeader,
        payload: { certificateId: '123', email: 'me@here.com' }
      }
      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)
      expect(payload).toEqual({
        certificateIssued: new Date('2024-07-30').toISOString()
      })
      expect(issueCertificateMock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser, { certificateId: '123', email: 'me@here.com' })
    })

    test('should return 201 and update email', async () => {
      const issueCertificateMock = jest.fn()

      getCdoService.mockReturnValue({
        issueCertificate: issueCertificateMock
      })

      issueCertificateMock.mockResolvedValue(new Date('2024-07-30'))

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...portalHeader,
        payload: { certificateId: '123', email: 'me@here.com', updateEmail: true }
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(201)
      expect(issueCertificateMock).toHaveBeenCalledWith('ED123', expect.any(Date), devUser, { certificateId: '123', email: 'me@here.com', updateEmail: true })
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should throw a 404 given index does not exist', async () => {
      getCdoService.mockReturnValue({
        issueCertificate: async () => {
          throw new NotFoundError('not found')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should throw a 409 given action performed out of sequence', async () => {
      getCdoService.mockReturnValue({
        issueCertificate: async () => {
          throw new SequenceViolationError('Form 2 must be sent before performing this action')
        }
      })
      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should returns 500 given server error thrown', async () => {
      getCdoService.mockReturnValue({
        verifyDates: async () => {
          throw new Error('cdo error')
        }
      })

      const options = {
        method: 'POST',
        url: '/cdo/ED123/manage:issueCertificate',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })
})
