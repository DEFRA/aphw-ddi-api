const { addImportedDog } = require('../repos/dogs')
const { getDogByIndexNumber } = require('../dog/get-dog')

module.exports = [{
  method: 'GET',
  path: '/dog/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    let dog = null
    try {
      dog = await getDogByIndexNumber(indexNumber)
    } catch (e) {
      console.log(e)
    }

    return h.response({ dog }).code(200)
  }
},
{
  method: 'POST',
  path: '/dog',
  handler: async (request, h) => {
    const payload = JSON.parse(request.payload)
    await addImportedDog(payload.dog)

    return h.response('ok').code(200)
  }
}]
