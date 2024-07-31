const { getBreeds } = require('../repos/dogs')
const { dogBreedResponseSchema } = require('../schema/dogs/breeds')
const { mapDogBreed } = require('../dto/dog-breeds')

module.exports = {
  method: 'GET',
  path: '/dog-breeds',
  options: {
    tags: ['api'],
    notes: ['Returns the full list of dog breeds covered by the DDI'],
    response: {
      schema: dogBreedResponseSchema
    }
  },
  handler: async (request, h) => {
    const breedDaos = await getBreeds()

    const breeds = breedDaos.map(mapDogBreed)

    return h.response({
      breeds
    }).code(200)
  }
}
