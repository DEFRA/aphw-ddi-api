const { cdoCreateDto, cdoViewDto } = require('../dto/cdo')
const { createCdo, getCdo } = require('../repos/cdo')
const { getCallingUser } = require('../auth/get-user')
const cdoCreateSchema = require('../schema/cdo/create')
const { NotFoundError } = require('../errors/not-found')

module.exports = [{
  method: 'GET',
  path: '/cdo/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    try {
      const cdo = await getCdo(indexNumber)

      if (!cdo) {
        return h.response().code(404)
      }

      return h.response({ cdo: cdoViewDto(cdo) }).code(200)
    } catch (e) {
      console.log(`Error retrieving cdo record: ${e}`)
      throw e
    }
  }
},
{
  method: 'POST',
  path: '/cdo',
  options: {
    validate: {
      payload: cdoCreateSchema,
      failAction: (request, h, err) => {
        console.error(err)

        return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      try {
        const created = await createCdo(request.payload, getCallingUser(request))
        const res = cdoCreateDto(created)
        return h.response(res).code(200)
      } catch (e) {
        if (e instanceof NotFoundError) {
          return h.response().code(422).takeover()
        }
        throw e
      }
    }
  }
}]
