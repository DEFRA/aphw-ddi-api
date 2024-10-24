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
  recordMicrochipNumberResponseSchema, recordApplicationFeeSchema, verifyDatesSchema, manageCdoResponseSchema,
  recordMicrochipNumberConflictSchema,
  simpleConflictSchema, issueCertificateResponseSchema
} = require('../schema/cdo/manage')
const { SequenceViolationError } = require('../errors/domain/sequenceViolation')
const { InvalidDataError } = require('../errors/domain/invalidData')
const { InvalidDateError } = require('../errors/domain/invalidDate')
const { getCdoByIndexNumberSchema } = require('../schema/cdo/response')
const { auditDogDetailsView, auditDogActivityView } = require('../dto/auditing/view')

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

        if (request.query.type === 'activity') {
          await auditDogActivityView(cdo, getCallingUser(request))
        } else {
          await auditDogDetailsView(cdo, getCallingUser(request))
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
      tags: ['api'],
      notes: ['Returns current progress of the CDO application'],
      response: {
        status: {
          200: manageCdoResponseSchema,
          404: undefined
        }
      }
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
      tags: ['api'],
      notes: ['Send Application Pack Manage CDO domain action.  Publishes application pack sent event & updates the status of the sendApplicationPack stage of the CDO tasklist.  Completion of this is necessary in order to perform subsequent tasks.'],
      response: {
        status: {
          204: undefined,
          409: simpleConflictSchema
        }
      }
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
      notes: ['Record Insurance Details Manage CDO domain action. Records latest insurance details on CDO application'],
      validate: {
        payload: recordInsuranceDetailsSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        status: {
          201: recordInsuranceDetailsResponseSchema
        }
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
      notes: ['Record Microchip number Manage CDO domain action.  Record microchip number update as part of CDO application'],
      validate: {
        payload: recordMicrochipNumberSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        status: {
          201: recordMicrochipNumberResponseSchema,
          409: recordMicrochipNumberConflictSchema
        }
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
      notes: ['Record application Fee Manage CDO domain action.  Record application fee payment as part of CDO Tasklist'],
      validate: {
        payload: recordApplicationFeeSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        status: {
          201: recordApplicationFeeSchema
        }
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
      tags: ['api'],
      notes: ['Send Form2 Manage CDO domain action.  Publishes a send Form2 event and updates status on CDO tasklist.  Task is required in order to Record verification dates'],
      response: {
        status: {
          204: undefined,
          409: simpleConflictSchema
        }
      }
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
      notes: ['Verify Dates Manage CDO domain action.'],
      validate: {
        payload: verifyDatesSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        status: {
          201: verifyDatesSchema
        }
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
      notes: ['Issue Certificate domain action on Manage CDO.  All other actions need to be complete in order to perform.'],
      response: {
        status: {
          201: issueCertificateResponseSchema
        }
      },
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
