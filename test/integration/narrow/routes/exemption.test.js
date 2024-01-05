describe('Exemption endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/exemption')
  const { updateExemption } = require('../../../../app/repos/exemption')

  jest.mock('../../../../app/repos/cdo')
  const { getCdo } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('PUT /exemption route returns 200 with valid payload', async () => {
    const payload = {
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
          exemption_order: 2015
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
      payload
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(updateExemption).toHaveBeenCalled()
  })

  test('PUT /exemption returns 400 with invalid payload', async () => {
    const options = {
      method: 'PUT',
      url: '/exemption',
      payload: {}
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
