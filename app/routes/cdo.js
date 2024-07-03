const { cdoCreateDto, cdoViewDto } = require('../dto/cdo')
const { createCdo, getCdo } = require('../repos/cdo')
const { getCallingUser } = require('../auth/get-user')
const cdoCreateSchema = require('../schema/cdo/create')
const { NotFoundError } = require('../errors/not-found')
const ServiceProvider = require('../service/config')
const { mapCdoTaskListToDto } = require('../dto/cdoTaskList')
const { ActionAlreadyPerformedError } = require('../errors/domain/actionAlreadyPerformed')
const {
  recordInsuranceDetailsSchema, recordInsuranceDetailsResponseSchema, recordMicrochipNumberSchema,
  recordMicrochipNumberResponseSchema
} = require('../schema/cdo/manage')
const { SequenceViolationError } = require('../errors/domain/sequenceViolation')
const { InvalidDataError } = require('../errors/domain/invalidData')

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
        const cdoService = ServiceProvider.getCdoService()
        const cdoTaskList = await cdoService.getTaskList(indexNumber)

        const manageCdo = mapCdoTaskListToDto(cdoTaskList)

        return h.response(manageCdo).code(200)
      } catch (e) {
        if (e instanceof NotFoundError) {
          return h.response().code(404)
        }
        console.log('Error retrieving cdo record:', e)
        throw e
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:sendApplicationPack',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber

      try {
        const cdoService = ServiceProvider.getCdoService()
        await cdoService.sendApplicationPack(indexNumber, new Date(), getCallingUser(request))

        return h.response().code(204)
      } catch (e) {
        if (e instanceof NotFoundError) {
          return h.response().code(404)
        }
        if (e instanceof ActionAlreadyPerformedError) {
          return h.response().code(409)
        }
        console.error('Error sending application pack cdo record:', e)
        throw e
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:recordInsuranceDetails',
    options: {
      validate: {
        payload: recordInsuranceDetailsSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: recordInsuranceDetailsResponseSchema
      },
      handler: async (request, h) => {
        const indexNumber = request.params.indexNumber
        const { insuranceCompany, insuranceRenewal } = request.payload

        try {
          const cdoService = ServiceProvider.getCdoService()
          await cdoService.recordInsuranceDetails(indexNumber, { insuranceCompany, insuranceRenewal }, getCallingUser(request))

          return h.response({
            insuranceCompany,
            insuranceRenewal
          }).code(201)
        } catch (e) {
          if (e instanceof NotFoundError) {
            console.error('CDO record not found:', e)
            return h.response().code(404)
          }
          if (e instanceof SequenceViolationError) {
            return h.response().code(409)
          }
          console.log('Error retrieving cdo record:', e)
          throw e
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:recordMicrochipNumber',
    options: {
      validate: {
        payload: recordMicrochipNumberSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: recordMicrochipNumberResponseSchema
      },
      handler: async (request, h) => {
        const indexNumber = request.params.indexNumber
        const { microchipNumber } = request.payload

        try {
          const cdoService = ServiceProvider.getCdoService()
          const cdoTaskList = await cdoService.recordMicrochipNumber(indexNumber, { microchipNumber }, getCallingUser(request))

          return h.response({
            microchipNumber: cdoTaskList.cdoSummary.microchipNumber
          }).code(201)
        } catch (e) {
          if (e instanceof NotFoundError) {
            console.error('CDO record not found:', e)
            return h.response().code(404)
          }
          if (e instanceof SequenceViolationError) {
            console.error('CDO action out of sequence:', e)
            return h.response().code(409)
          }
          if (e instanceof InvalidDataError) {
            console.error('Error recording MicrochipNumber:', e)
            return h.response().code(400)
          }
          console.log('Error recording MicrochipNumber:', e)
          throw e
        }
      }
    }
  }
]
