const { getCallingUser } = require('../auth/get-user')
const { dogsQueryParamsSchema } = require('../schema/dogs/get')
const { addImportedDog, updateDog, getDogByIndexNumber, deleteDogByIndexNumber, getOldDogs, deleteDogs } = require('../repos/dogs')
const { dogDto, oldDogDto } = require('../dto/dog')
const { personDto, mapPersonAndDogsByIndexDao } = require('../dto/person')
const { getOwnerOfDog, getPersonAndDogsByIndex } = require('../repos/people')
const { deleteDogsPayloadSchema, deleteDogsResponseSchema } = require('../schema/dogs/delete')

module.exports = [
  {
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
        console.log('Error in GET /dog', e)
        throw e
      }
    }
  },
  {
    method: 'GET',
    path: '/dog-owner/{indexNumber}',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      let ownerDao
      let owner

      try {
        if (request.query.includeDogs === 'true') {
          ownerDao = await getPersonAndDogsByIndex(indexNumber)
        } else {
          ownerDao = await getOwnerOfDog(indexNumber)
        }

        if (ownerDao === null) {
          return h.response().code(404)
        }

        if (request.query.includeDogs === 'true') {
          owner = mapPersonAndDogsByIndexDao(ownerDao)
        } else {
          owner = personDto(ownerDao.person, true)
        }

        return h.response({ owner }).code(200)
      } catch (e) {
        console.log('Error in GET /dog-owner', e)
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
        console.log('Error updating dog:', e)
        throw e
      }
    }
  },
  {
    method: 'DELETE',
    path: '/dog/{indexNumber}',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber

      const dog = await getDogByIndexNumber(indexNumber)

      if (dog === null) {
        return h.response().code(404)
      }

      try {
        await deleteDogByIndexNumber(indexNumber, getCallingUser(request))

        return h.response().code(204)
      } catch (e) {
        console.log('Error updating dog:', e)
        throw e
      }
    }
  },
  {
    method: 'GET',
    path: '/dogs',
    options: {
      validate: {
        query: dogsQueryParamsSchema,
        failAction: (request, h, error) => {
          console.log(error)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        let dogs = []

        const sort = {
          sortKey: request.query.sortKey,
          sortOrder: request.query.sortOrder
        }

        if (request.query.forPurging === true) {
          dogs = await getOldDogs('Exempt,Inactive,Withdrawn,Failed', sort) // , new Date(2038, 7, 2))
        }

        const mappedDogs = dogs.map(oldDogDto)

        return h.response(mappedDogs).code(200)
      }
    }
  },
  {
    method: 'POST',
    path: '/dogs:batch-delete',
    options: {
      validate: {
        payload: deleteDogsPayloadSchema,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      response: {
        schema: deleteDogsResponseSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      }
    },
    handler: async (request, h) => {
      const dogPks = request.payload.dogPks

      const result = await deleteDogs(dogPks, getCallingUser(request))
      return h.response(result).code(200)
    }
  }
]
