const { getBreachCategories } = require('../repos/breaches')
const ServiceProvider = require('../service/config')
const { getCallingUser } = require('../auth/get-user')
const { mapDogToDogDto } = require('../repos/mappers/dog')
const { setBreachRequestSchema, setBreachResponseSchema } = require('../schema/breaches')

module.exports = [
  {
    method: 'GET',
    path: '/breaches/categories',
    handler: async (request, h) => {
      const breachCategories = await getBreachCategories(true)

      return h.response({
        breachCategories
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/breaches/dog:setBreaches',
    options: {
      validate: {
        payload: setBreachRequestSchema
      },
      response: {
        schema: setBreachResponseSchema
      },
      handler: async (request, h) => {
        const payload = request.payload
        const dogService = ServiceProvider.getDogService()
        const dog = await dogService.setBreaches(payload.indexNumber, payload.dogBreaches, getCallingUser(request))

        const results = mapDogToDogDto(dog)
        return h.response(results).code(200)
      }
    }
  }
]
