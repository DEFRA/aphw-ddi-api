const { getBreachCategories } = require('../repos/breaches')

module.exports = {
  method: 'GET',
  path: '/breaches/categories',
  handler: async (request, h) => {
    const breachCategories = await getBreachCategories()

    return h.response({
      breachCategories
    }).code(200)
  }
}
