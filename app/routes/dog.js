const { addImportedDog, getDogByIndexNumber } = require('../repos/dogs')

module.exports = [{
  method: 'GET',
  path: '/dog/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    const dog = await getDogByIndexNumber(indexNumber)
    return h.response({ dog }).code(200)
  }
},
{
  method: 'POST',
  path: '/dog',
  handler: async (request, h) => {
    if (!request.payload?.dog) {
      return h.response().code(400)
    }

    await addImportedDog(request.payload.dog)

    return h.response('ok').code(200)
  }
}]
