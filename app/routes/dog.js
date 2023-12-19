const { addImportedDog, updateDog, getDogByIndexNumber } = require('../repos/dogs')
const { dogDto } = require('../dto/dog')

module.exports = [{
  method: 'GET',
  path: '/dog/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    try {
      const dog = await getDogByIndexNumber(indexNumber)
      return h.response({ dog: dogDto(dog) }).code(200)
    } catch (e) {
      console.log(e)
      throw e
    }
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
