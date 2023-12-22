describe('Exemption endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/exemption')
  const { updateExemption } = require('../../../../app/repos/exemption')

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
      certificateIssuedDate: '2020-03-01',
      applicationFeePaidDate: '2020-03-01',
      neuteringConfirmationDate: '2020-04-01',
      exemptionSchemeJoinDate: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2020-06-01'
      }
    }

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
