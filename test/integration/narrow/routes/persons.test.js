describe('CDO endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  // jest.mock('../../../../app/repos/people')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /persons route returns 200 with valid payload', async () => {
    const options = {
      method: 'GET',
      url: '/persons'
    }

    // const expectedPersons = [{
    //   firstName: 'John',
    //   lastName: 'Doe',
    //   birthDate: '1990-01-01',
    //   personReference: 'ABC123',
    //   address: {
    //     addressLine1: '1 Test Street',
    //     addressLine2: 'Test',
    //     town: 'Test',
    //     postcode: 'TE1 1ST',
    //     country: 'England'
    //   },
    //   contacts: {
    //     emails: [
    //       'test@example.com'
    //     ],
    //     primaryTelephones: ['01234567890'],
    //     secondaryTelephones: ['07890123456']
    //   }
    // }]

    // getPersonByReference.mockResolvedValue({
    //   first_name: 'John',
    //   last_name: 'Doe',
    //   birth_date: '1990-01-01',
    //   person_reference: 'ABC123',
    //   addresses: [
    //     {
    //       address: {
    //         address_line_1: '1 Test Street',
    //         address_line_2: 'Test',
    //         town: 'Test',
    //         postcode: 'TE1 1ST',
    //         country: {
    //           country: 'England'
    //         }
    //       }
    //     }
    //   ],
    //   person_contacts: [
    //     {
    //       contact: {
    //         id: 1,
    //         contact_type: { contact_type: 'Email' },
    //         contact: 'test@example.com'
    //       }
    //     }
    //   ]
    // })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({ persons: [] })
  })

  test('GET /persons route with search params returns 200 with valid payload', async () => {
    const options = {
      method: 'GET',
      url: '/persons?firstName=Frodo&lastName=Baggins&dateOfBirth=2968-09-22'
    }

    // const expectedPerson = {
    //   firstName: 'Frodo',
    //   lastName: 'Baggins',
    //   birthDate: '2968-09-22',
    //   personReference: 'ABC123',
    //   address: {
    //     addressLine1: 'Bag End',
    //     addressLine2: 'Hobbiton',
    //     town: 'The Shire',
    //     postcode: 'SH1 2AA',
    //     country: 'Eriador'
    //   },
    //   contacts: {
    //     emails: [
    //       'frodo@example.com'
    //     ],
    //     primaryTelephones: [],
    //     secondaryTelephones: []
    //   }
    // }

    // getPersonByReference.mockResolvedValue({
    //   first_name: 'John',
    //   last_name: 'Doe',
    //   birth_date: '1990-01-01',
    //   person_reference: 'ABC123',
    //   addresses: [
    //     {
    //       address: {
    //         address_line_1: '1 Test Street',
    //         address_line_2: 'Test',
    //         town: 'Test',
    //         postcode: 'TE1 1ST',
    //         country: {
    //           country: 'England'
    //         }
    //       }
    //     }
    //   ],
    //   person_contacts: [
    //     {
    //       contact: {
    //         id: 1,
    //         contact_type: { contact_type: 'Email' },
    //         contact: 'test@example.com'
    //       }
    //     }
    //   ]
    // })

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({ persons: [] })
  })

  test('GET /persons route returns 400 given invalid params', async () => {
    const options = {
      method: 'GET',
      url: '/persons?unknownParam=test'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})
