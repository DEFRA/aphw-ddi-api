const { getCallingUser } = require('../auth/get-user')
const { dogsQueryParamsSchema, getDogResponseSchema, dogsResponseSchema } = require('../schema/dogs/get')
const { addImportedDog, updateDog, getDogByIndexNumber, deleteDogByIndexNumber, getOldDogs, deleteDogs } = require('../repos/dogs')
const { dogDto, oldDogDto, putDogDto } = require('../dto/dog')
const { personDto, mapPersonAndDogsByIndexDao } = require('../dto/person')
const { getOwnerOfDog, getPersonAndDogsByIndex } = require('../repos/people')
const { deleteDogsPayloadSchema } = require('../schema/dogs/delete')
const { deleteResponseSchema } = require('../schema/shared/delete')
const { importDogSchema, updateDogSchema } = require('../schema/dogs/response')
const { putDogPayloadSchema } = require('../schema/dogs/put')
const { dogOwnerResponseSchema, dogOwnerQuerySchema } = require('../schema/person/dog-owner')

module.exports = [
  {
    method: 'GET',
    path: '/dog/{indexNumber}',
    options: {
      tags: ['api'],
      notes: ['Get dog by index number'],
      response: {
        schema: getDogResponseSchema
      }
    },
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      try {
        const dog = await getDogByIndexNumber(indexNumber)

        if (dog === null) {
          return h.response().code(404)
        }
        const dogDto1 = dogDto(dog)

        return h.response({ dog: dogDto1 }).code(200)
      } catch (e) {
        console.log('Error in GET /dog', e)
        throw e
      }
    }
  },
  {
    method: 'GET',
    path: '/dog-owner/{indexNumber}',
    options: {
      tags: ['api'],
      notes: ['Gets owner details of a dog by dog index number'],
      validate: {
        query: dogOwnerQuerySchema
      },
      response: {
        status: {
          404: undefined,
          200: dogOwnerResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      let ownerDao
      let owner

      try {
        if (request.query.includeDogs) {
          ownerDao = await getPersonAndDogsByIndex(indexNumber)
        } else {
          ownerDao = await getOwnerOfDog(indexNumber)
        }

        if (ownerDao === null) {
          return h.response().code(404)
        }

        if (request.query.includeDogs) {
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
    options: {
      tags: ['api'],
      notes: ['Imports a dog'],
      response: {
        schema: importDogSchema
      }
    },
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
    options: {
      tags: ['api'],
      notes: ['Update details on an individual dog'],
      response: {
        schema: updateDogSchema
      },
      validate: {
        payload: putDogPayloadSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      }
    },
    handler: async (request, h) => {
      if (!request.payload?.indexNumber) {
        return h.response().code(400)
      }

      try {
        const updatedDogDao = await updateDog(request.payload, getCallingUser(request))

        const updatedDog = putDogDto(updatedDogDao)

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
    options: {
      tags: ['api'],
      notes: ['Soft Delete a dog by index number'],
      response: {
        status: {
          204: undefined,
          404: undefined
        }
      }
    },
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
      tags: ['api'],
      notes: ['Returns a filtered list of dogs on the index, with summary details'],
      response: {
        status: {
          400: undefined,
          200: dogsResponseSchema
        }
      },
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
          dogs = await getOldDogs(request.query.statuses, sort, request.query.today)
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
      tags: ['api'],
      notes: ['Soft deletes a batch of dogs by dog index number'],
      validate: {
        payload: deleteDogsPayloadSchema,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      response: {
        schema: deleteResponseSchema,
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
