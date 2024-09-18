const { devUser, mockValidate } = require('../../../mocks/auth')
const { buildDogDto, buildBreachDto } = require('../../../mocks/cdo/dto')
const {
  NOT_COVERED_BY_INSURANCE,
  INSECURE_PLACE,
  AWAY_FROM_ADDR_30_DAYS_IN_YR, buildCdoDog
} = require('../../../mocks/cdo/domain')
const { Dog } = require('../../../../app/data/domain')
const { portalHeader } = require('../../../mocks/jwt')

describe('Breaches endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/breaches')
  const { getBreachCategories } = require('../../../../app/repos/breaches')

  jest.mock('../../../../app/service/config')
  const { getDogService } = require('../../../../app/service/config')

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')
  validate.mockResolvedValue(mockValidate)

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
        url: '/breaches/categories',
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload.breachCategories).toEqual(expectedBreachCategories)
      expect(getBreachCategories).toHaveBeenCalledWith(true)
    })
  })

  describe('POST /breaches/dog:setBreaches', () => {
    test('should return 200 given valid payload', async () => {
      const dog = new Dog(buildCdoDog({
        dogBreaches: [
          NOT_COVERED_BY_INSURANCE,
          INSECURE_PLACE,
          AWAY_FROM_ADDR_30_DAYS_IN_YR
        ]
      }))
      const setBreachesMock = jest.fn(async () => dog)
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
        },
        ...portalHeader
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload).toEqual(buildDogDto({
        breaches: [
          buildBreachDto(NOT_COVERED_BY_INSURANCE),
          buildBreachDto(INSECURE_PLACE),
          buildBreachDto(AWAY_FROM_ADDR_30_DAYS_IN_YR)
        ]
      }))

      expect(setBreachesMock).toHaveBeenCalledWith(
        'ED12345',
        [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ],
        devUser)
    })

    test('should return 400 given invalid payload', async () => {
      const options = {
        method: 'POST',
        url: '/breaches/dog:setBreaches',
        payload: {
          indexNumber: 'ED12345'
        },
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
