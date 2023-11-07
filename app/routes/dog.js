const addDog = require('../dog/add-dog')
const { getDogById } = require('../dog/get-dog')

module.exports = [{
  method: 'GET',
  path: '/dog/{id}',
  handler: async (request, h) => {
    const id = request.params.id
    let dog = null
    try {
      dog = await getDogById(id)
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
    await addDog(payload.dog)

    return h.response('ok').code(200)
  }
}]
