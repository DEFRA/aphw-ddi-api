const { getCallingUser } = require('../auth/get-user')
const { addImportedDog, updateDog, getDogByIndexNumber } = require('../repos/dogs')
const { dogDto } = require('../dto/dog')
const { personDto } = require('../dto/person')
const { getOwnerOfDog } = require('../repos/people')

module.exports = [{
  method: 'GET',
  path: '/dog/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    try {
      const dog = await getDogByIndexNumber(indexNumber)

      if (dog === null) {
        return h.response().code(404)
      }
      return h.response({ dog: dogDto(dog) }).code(200)
    } catch (e) {
      console.log(e)
      throw e
    }
  }
},
{
  method: 'GET',
  path: '/dog-owner/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber

    try {
      const owner = await getOwnerOfDog(indexNumber)

      if (owner === null) {
        return h.response().code(404)
      }

      return h.response({ owner: personDto(owner.person, true) }).code(200)
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

    await addImportedDog(request.payload.dog, getCallingUser(request))

    return h.response('ok').code(200)
  }
},
{
  method: 'PUT',
  path: '/dog',
  handler: async (request, h) => {
    if (!request.payload?.indexNumber) {
      return h.response().code(400)
    }

    try {
      const updatedDog = await updateDog(request.payload, getCallingUser(request))

      return h.response(updatedDog).code(200)
    } catch (e) {
      console.log(`Error updating dog: ${e}`)
      throw e
    }
  }
}]
