const { cdoCreateDto, cdoViewDto } = require('../dto/cdo')
const { createCdo, getCdo } = require('../repos/cdo')
const { getCallingUser } = require('../auth/get-user')
const cdoCreateSchema = require('../schema/cdo/create')
const { NotFoundError } = require('../errors/not-found')

module.exports = [
  {
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
        console.log('Error retrieving cdo record:', e)
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
  },
  {
    method: 'GET',
    path: '/cdo/{indexNumber}/manage',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      try {
        const cdo = await getCdo(indexNumber)

        if (!cdo) {
          return h.response().code(404)
        }

        const tasks = {
          applicationPackSent: {
            key: 'applicationPackSent',
            available: true,
            completed: false,
            editable: true,
            timestamp: undefined
          },
          insuranceDetailsRecorded: {
            key: 'insuranceDetailsRecorded',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          },
          microchipNumberRecorded: {
            key: 'microchipNumberRecorded',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          },
          applicationFeePaid: {
            key: 'applicationFeePaid',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          },
          form2Sent: {
            key: 'form2Sent',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          },
          verificationDateRecorded: {
            key: 'verificationDateRecorded',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          },
          certificateIssued: {
            key: 'certificateIssued',
            available: false,
            completed: false,
            editable: false,
            timestamp: undefined
          }
        }

        return h.response({ tasks }).code(200)
      } catch (e) {
        console.log('Error retrieving cdo record:', e)
        throw e
      }
    }
  }
]
