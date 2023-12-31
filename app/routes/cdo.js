const { cdoCreateDto, cdoViewDto } = require('../dto/cdo')
const { createCdo, getCdo } = require('../repos/cdo')
const cdoCreateSchema = require('../schema/cdo/create')

module.exports = [{
  method: 'GET',
  path: '/cdo/{indexNumber}',
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    try {
      const cdo = await getCdo(indexNumber)
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
      const created = await createCdo(request.payload)

      const res = cdoCreateDto(created)

      return h.response(res).code(200)
    }
  }
}]
