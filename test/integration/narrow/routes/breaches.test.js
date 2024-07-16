describe('Breaches endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/breaches')
  const { getBreachCategories } = require('../../../../app/repos/breaches')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /breaches/categories route returns 200', async () => {
    const expectedBreachCategories = [
      {
        id: 1,
        label: 'Dog not covered by third party insurance',
        short_name: 'NOT_COVERED_BY_INSURANCE'
      },
      {
        id: 2,
        label: 'Dog not kept on lead or muzzled',
        short_name: 'NOT_ON_LEAD_OR_MUZZLED'
      },
      {
        id: 3,
        label: 'Dog kept in insecure place',
        short_name: 'INSECURE_PLACE'
      }
    ]
    getBreachCategories.mockResolvedValue(expectedBreachCategories)

    const options = {
      method: 'GET',
      url: '/breaches/categories'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload.breachCategories).toEqual(expectedBreachCategories)
  })

  afterEach(async () => {
    await server.stop()
  })
})
