const { addImportedDog, updateDog, getDogByIndexNumber } = require('../repos/dogs')

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
},
{
  method: 'PUT',
  path: '/dog',
  handler: async (request, h) => {
    if (!request.payload) {
      return h.response().code(400)
    }

    const updatedDog = await updateDog(request.payload)

    return h.response(updatedDog).code(200)
  }
}]
