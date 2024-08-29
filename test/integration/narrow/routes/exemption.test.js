const {
  buildDogBreedDao, buildStatusDao, buildRegistrationDao, buildRegisteredPersonDao, buildCourtDao,
  buildPoliceForceDao, buildExemptionOrderDao, buildCdoDao
} = require('../../../mocks/cdo/get')
const { mockValidate, authHeaders } = require('../../../mocks/auth')

describe('Exemption endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/exemption')
  const { updateExemption } = require('../../../../app/repos/exemption')

  jest.mock('../../../../app/repos/cdo')
  const { getCdo } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('PUT /exemption route returns 200 with valid 2015 payload', async () => {
    const payload = {
      exemptionOrder: 2015,
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      joinedExemptionScheme: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2020-06-01'
      }
    }

    getCdo.mockResolvedValue(buildCdoDao({
      id: 123,
      index_number: 'ED123',
      dog_breed: buildDogBreedDao({
        breed: 'breed1'
      }),
      status: buildStatusDao({
        status: 'NEW'
      }),
      registration: buildRegistrationDao({
        court: buildCourtDao({
          name: 'court1'
        }),
        police_force: buildPoliceForceDao({
          name: 'force1'
        })
      }),
      registered_person: [buildRegisteredPersonDao()]
    }))

    updateExemption.mockResolvedValue({
      id: 123,
      dog_id: 300095,
      index_number: 'ED123',
      dog_breed: {
        breed: 'breed1'
      },
      status: {
        status: 'NEW'
      },
      court: {
        name: 'court1'
      },
      police_force: {
        name: 'force1'
      },
      exemption_order: {
        exemption_order: '2015'
      },
      registered_person: [{
        person: {
        }
      }]
    })

    const options = {
      method: 'PUT',
      url: '/exemption',
      payload,
      ...authHeaders
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(updateExemption).toHaveBeenCalled()
  })

  test('PUT /exemption route returns 200 with valid 2023 payload', async () => {
    const payload = {
      exemptionOrder: 2023,
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      joinedExemptionScheme: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2020-06-01'
      },
      microchipDeadline: '2020-06-01',
      typedByDlo: '2020-07-01',
      withdrawn: '2020-08-01'
    }

    updateExemption.mockResolvedValue({
      id: 123,
      dog_id: 300095,
      index_number: 'ED123',
      dog_breed: {
        breed: 'breed1'
      },
      status: {
        status: 'NEW'
      },
      court: {
        name: 'court1'
      },
      police_force: {
        name: 'force1'
      },
      exemption_order: {
        exemption_order: '2023'
      },
      registered_person: [{
        person: {
        }
      }]
    })

    getCdo.mockResolvedValue(buildCdoDao({
      id: 123,
      index_number: 'ED123',
      dog_breed: buildDogBreedDao({
        breed: 'breed1'
      }),
      status: buildStatusDao({
        status: 'NEW'
      }),
      registration: buildRegistrationDao({
        court: buildCourtDao({
          name: 'court1'
        }),
        police_force: buildPoliceForceDao({
          name: 'force1'
        }),
        exemption_order: buildExemptionOrderDao({
          exemption_order: '2023'
        })
      }),
      registered_person: [buildRegisteredPersonDao()]
    }))

    const options = {
      method: 'PUT',
      url: '/exemption',
      payload,
      ...authHeaders
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(updateExemption).toHaveBeenCalled()
  })

  test('PUT /exemption returns 400 with invalid 2015 payload', async () => {
    const options = {
      method: 'PUT',
      url: '/exemption',
      payload: {},
      ...authHeaders
    }

    getCdo.mockResolvedValue({
      id: 123,
      index_number: 'ED123',
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
          exemption_order: '2015'
        }
      },
      registered_person: [{
        person: {
        }
      }]
    })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('PUT /exemption returns 400 with 2015 payload containing 2023 data', async () => {
    const payload = {
      exemptionOrder: 2015,
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      joinedExemptionScheme: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2020-06-01'
      },
      microchipDeadline: '2020-06-01',
      typedByDlo: '2020-07-01',
      withdrawn: '2020-08-01'
    }

    getCdo.mockResolvedValue({
      id: 123,
      index_number: 'ED123',
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
          exemption_order: '2015'
        }
      },
      registered_person: [{
        person: {
        }
      }]
    })

    const options = {
      method: 'PUT',
      url: '/exemption',
      payload,
      ...authHeaders
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
