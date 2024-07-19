const { devUser } = require('../../../mocks/auth')
describe('Breaches endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/breaches')
  const { getBreachCategories } = require('../../../../app/repos/breaches')

  jest.mock('../../../../app/service/config')
  const { getDogService } = require('../../../../app/service/config')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    getCallingUser.mockReturnValue(devUser)
    await server.initialize()
  })

  describe('GET /breaches/categories', () => {
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
  })

  describe('POST /breaches/dog:setBreaches', () => {
    test('returns 200', async () => {
      const setBreachesMock = jest.fn()
      getDogService.mockReturnValue({
        setBreaches: setBreachesMock
      })
      const options = {
        method: 'POST',
        url: '/breaches/dog:setBreaches',
        payload: {
          indexNumber: 'ED12345',
          dogBreaches: [
            'NOT_COVERED_BY_INSURANCE',
            'NOT_ON_LEAD_OR_MUZZLED',
            'INSECURE_PLACE'
          ]
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(setBreachesMock).toHaveBeenCalledWith(
        'ED12345',
        [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ],
        devUser)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
