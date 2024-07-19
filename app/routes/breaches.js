const { getBreachCategories } = require('../repos/breaches')
const ServiceProvider = require('../service/config')
const { getCallingUser } = require('../auth/get-user')

module.exports = [
  {
    method: 'GET',
    path: '/breaches/categories',
    handler: async (request, h) => {
      const breachCategories = await getBreachCategories()

      return h.response({
        breachCategories
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/breaches/dog:setBreaches',
    handler: async (request, h) => {
      const payload = request.payload
      const dogService = ServiceProvider.getDogService()
      const results = await dogService.setBreaches(payload.indexNumber, payload.dogBreaches, getCallingUser(request))
      return h.response(results).code(200)
    }
  }
]
