const { cdoCreateDto, cdoViewDto } = require('../dto/cdo')
const { createCdo, getCdo } = require('../repos/cdo')
const { getCallingUser } = require('../auth/get-user')
const { createCdoRequestSchema, createCdoResponseSchema } = require('../schema/cdo/create')
const { NotFoundError } = require('../errors/not-found')
const ServiceProvider = require('../service/config')
const { mapCdoTaskListToDto } = require('../dto/cdoTaskList')
const { ActionAlreadyPerformedError } = require('../errors/domain/actionAlreadyPerformed')
const {
  recordInsuranceDetailsSchema, recordInsuranceDetailsResponseSchema, recordMicrochipNumberSchema,
  recordMicrochipNumberResponseSchema, recordApplicationFeeSchema, verifyDatesSchema
} = require('../schema/cdo/manage')
const { SequenceViolationError } = require('../errors/domain/sequenceViolation')
const { InvalidDataError } = require('../errors/domain/invalidData')
const { InvalidDateError } = require('../errors/domain/invalidDate')
const { getCdoByIndexNumberSchema } = require('../schema/cdo/response')

/**
 * @param e
 * @param action
 * @param indexNumber
 * @param h
 * @return {*}
 */
const handleErrors = (e, action, indexNumber, h) => {
  if (e instanceof NotFoundError) {
    console.error(`CDO record ${indexNumber} not found on manage:${action}:`, e)
    return h.response().code(404)
  }
  if (e instanceof SequenceViolationError) {
    const message = `CDO action on ${indexNumber} out of sequence on manage:${action}`
    console.error(message, e)
    return h.response({ message }).code(409)
  }
  if (e instanceof ActionAlreadyPerformedError) {
    const message = `CDO action on ${indexNumber} action already performed manage:${action}`
    console.error(message, e)
    return h.response({ message }).code(409)
  }
  if (e instanceof InvalidDataError) {
    console.error(`Invalid data on manage:${action} on ${indexNumber}:`, e)
    return h.response().code(400)
  }
  if (e instanceof InvalidDateError) {
    console.error(`Invalid date on manage:${action} on ${indexNumber}:`, e)
    return h.response().code(400)
  }

  console.error(`Unknown error on CDO manage:${action} on ${indexNumber}:`, e)
  throw e
}
module.exports = [
  {
    method: 'GET',
    path: '/cdo/{indexNumber}',
    options: {
      tags: ['api'],
      notes: ['Returns the full CDO with dog, person and exemption details'],
      response: {
        status: {
          404: undefined,
          200: getCdoByIndexNumberSchema
        }
      }
    },
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      try {
        const cdo = await getCdo(indexNumber)

        if (!cdo) {
          return h.response().code(404)
        }

        const cdoDto = cdoViewDto(cdo)

        return h.response({ cdo: cdoDto }).code(200)
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
      tags: ['api'],
      notes: ['Creates a new CDO'],
      response: {
        status: {
          200: createCdoResponseSchema,
          422: undefined
        }
      },
      validate: {
        payload: createCdoRequestSchema,
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
    options: {
      tags: ['api']
    },
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
    options: {
      tags: ['api']
    },
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber

      try {
        const cdoService = ServiceProvider.getCdoService()
        await cdoService.sendApplicationPack(indexNumber, new Date(), getCallingUser(request))

        return h.response().code(204)
      } catch (e) {
        return handleErrors(e, 'sendApplicationPack', indexNumber, h)
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:recordInsuranceDetails',
    options: {
      tags: ['api'],
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

        try {
          const cdoService = ServiceProvider.getCdoService()
          const cdoTaskList = await cdoService.recordInsuranceDetails(indexNumber, request.payload, getCallingUser(request))

          return h.response({
            insuranceCompany: cdoTaskList.cdoSummary.insuranceCompany,
            insuranceRenewal: cdoTaskList.cdoSummary.insuranceRenewal
          }).code(201)
        } catch (e) {
          return handleErrors(e, 'recordInsuranceDetails', indexNumber, h)
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:recordMicrochipNumber',
    options: {
      tags: ['api'],
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

        try {
          const cdoService = ServiceProvider.getCdoService()
          const cdoTaskList = await cdoService.recordMicrochipNumber(indexNumber, request.payload, getCallingUser(request))

          return h.response({
            microchipNumber: cdoTaskList.cdoSummary.microchipNumber
          }).code(201)
        } catch (e) {
          return handleErrors(e, 'recordMicrochipNumber', indexNumber, h)
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:recordApplicationFee',
    options: {
      tags: ['api'],
      validate: {
        payload: recordApplicationFeeSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: recordApplicationFeeSchema
      },
      handler: async (request, h) => {
        const indexNumber = request.params.indexNumber

        try {
          const cdoService = ServiceProvider.getCdoService()
          const cdoTaskList = await cdoService.recordApplicationFee(indexNumber, request.payload, getCallingUser(request))

          return h.response({
            applicationFeePaid: cdoTaskList.cdoSummary.applicationFeePaid
          }).code(201)
        } catch (e) {
          return handleErrors(e, 'recordApplicationFeeSchema', indexNumber, h)
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:sendForm2',
    options: {
      tags: ['api']
    },
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber

      try {
        const cdoService = ServiceProvider.getCdoService()
        await cdoService.sendForm2(indexNumber, new Date(), getCallingUser(request))

        return h.response().code(204)
      } catch (e) {
        return handleErrors(e, 'sendForm2', indexNumber, h)
      }
    }
  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:verifyDates',
    options: {
      tags: ['api'],
      validate: {
        payload: verifyDatesSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: verifyDatesSchema
      },
      handler: async (request, h) => {
        const indexNumber = request.params.indexNumber

        try {
          const cdoService = ServiceProvider.getCdoService()
          const cdoTaskList = await cdoService.verifyDates(indexNumber, request.payload, getCallingUser(request))

          return h.response({
            microchipVerification: cdoTaskList.cdoSummary.microchipVerification,
            neuteringConfirmation: cdoTaskList.cdoSummary.neuteringConfirmation
          }).code(201)
        } catch (e) {
          return handleErrors(e, 'verifyDates', indexNumber, h)
        }
      }
    }

  },
  {
    method: 'POST',
    path: '/cdo/{indexNumber}/manage:issueCertificate',
    options: {
      tags: ['api'],
      handler: async (request, h) => {
        const indexNumber = request.params.indexNumber

        try {
          const cdoService = ServiceProvider.getCdoService()
          const certificateId = await cdoService.issueCertificate(indexNumber, new Date(), getCallingUser(request))

          return h.response({
            certificateIssued: certificateId
          }).code(201)
        } catch (e) {
          return handleErrors(e, 'issueCertificate', indexNumber, h)
        }
      }
    }
  }
]
