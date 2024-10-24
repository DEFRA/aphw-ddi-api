const config = require('../config/index')
const { getRegistrationService } = require('../service/config')
const {
  createUserResponseSchema, createUserRequestSchema, userFeedbackSchema, userBooleanResponseSchema, userStringResponseSchema, bulkResponseSchema, bulkRequestSchema,
  getResponseSchema
} = require('../schema/user')
const { createAccount, deleteAccount, createAccounts, getAccounts } = require('../repos/user-accounts')
const { scopes } = require('../constants/auth')
const { mapUserDaoToDto } = require('../dto/mappers/user')
const { conflictSchema } = require('../schema/common/response/conflict')
const { notFoundSchema } = require('../schema/common/response/not-found')
const { getCallingUser } = require('../auth/get-user')
const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')
const { getHttpCodeFromResults } = require('../dto/mappers/bulk-requests')
const { drop } = require('../cache')

module.exports = [
  {
    method: 'POST',
    path: '/user',
    options: {
      tags: ['api'],
      notes: ['Creates a new user account'],
      response: {
        status: {
          201: createUserResponseSchema,
          409: conflictSchema,
          404: notFoundSchema
        }
      },
      validate: {
        payload: createUserRequestSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      auth: { scope: [scopes.admin] },
      handler: async (request, h) => {
        const userDao = await createAccount(request.payload, getCallingUser(request))

        const user = mapUserDaoToDto(userDao)

        return h.response(user).code(201)
      }
    }
  },
  {
    method: 'GET',
    path: '/users',
    options: {
      tags: ['api'],
      notes: ['Gets a full list of all user accounts'],
      response: {
        status: {
          200: getResponseSchema
        }
      },
      auth: { scope: [scopes.admin] },
      handler: async (request, h) => {
        const userDaos = await getAccounts()

        const users = userDaos.map(mapUserDaoToDto)

        return h.response({ users }).code(200)
      }
    }
  },
  {
    method: 'POST',
    path: '/users',
    options: {
      tags: ['api'],
      notes: ['Bulk creates a list of new user account'],
      response: {
        status: {
          200: bulkResponseSchema,
          500: bulkResponseSchema,
          409: bulkResponseSchema
        }
      },
      validate: {
        payload: bulkRequestSchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      auth: { scope: [scopes.admin] },
      handler: async (request, h) => {
        const createAccountsResult = await createAccounts(request.payload.users, getCallingUser(request))
        const mapErrors = ({ data, ...error }) => {
          return {
            ...error,
            username: data.username
          }
        }
        const bulkResponse = {
          users: createAccountsResult.items.map(mapUserDaoToDto),
          errors: createAccountsResult.errors?.map(mapErrors)
        }

        const responseCode = getHttpCodeFromResults(createAccountsResult)

        return h.response(bulkResponse).code(responseCode)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/user/{userId?}',
    options: {
      tags: ['api'],
      notes: ['Hard deletes a user account'],
      response: {
        status: {
          204: undefined,
          404: undefined
        }
      },
      handler: async (request, h) => {
        await deleteAccount(request.params.userId, getCallingUser(request))

        return h.response(undefined).code(204)
      }
    }
  },
  {
    method: 'GET',
    path: '/user/me/validate',
    options: {
      tags: ['api'],
      notes: ['Checks if the calling user is registered'],
      response: {
        status: {
          204: undefined,
          401: undefined
        }
      }
    },
    handler: async (request, h) => {
      return h.response(undefined).code(204)
    }
  },
  {
    method: 'GET',
    path: '/user/me/licence',
    options: {
      tags: ['api'],
      notes: ['Checks if the calling user has accepted the licence'],
      response: {
        status: {
          200: userBooleanResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      const res = await getRegistrationService().isUserLicenceAccepted(request)

      return h.response({ result: res }).code(200)
    }
  },
  {
    method: 'PUT',
    path: '/user/me/licence',
    options: {
      tags: ['api'],
      notes: ['Sets the date that the user accepted the licence'],
      response: {
        status: {
          200: userBooleanResponseSchema,
          500: userBooleanResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      const res = await getRegistrationService().setUserLicenceAccepted(request)

      return h.response({ result: res }).code(res ? 200 : 500)
    }
  },
  {
    method: 'GET',
    path: '/user/me/email',
    options: {
      tags: ['api'],
      notes: ['Checks if the calling user has verified their email address'],
      response: {
        status: {
          200: userBooleanResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      const res = await getRegistrationService().isUserEmailVerified(request)

      return h.response({ result: res }).code(200)
    }
  },
  {
    method: 'PUT',
    path: '/user/me/email',
    options: {
      tags: ['api'],
      notes: ['Sends and email with OTP to verfy users email address'],
      response: {
        status: {
          200: userBooleanResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      await getRegistrationService().sendVerifyEmail(request)

      return h.response({ result: true }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/user/me/email',
    options: {
      tags: ['api'],
      notes: ['Verifies the OTP code and activates account if successful'],
      response: {
        status: {
          200: userStringResponseSchema
        }
      }
    },
    handler: async (request, h) => {
      const res = await getRegistrationService().verifyEmailCode(request)

      return h.response({ result: res }).code(200)
    }
  },
  {
    method: 'DELETE',
    path: '/user/me/cache',
    options: {
      tags: ['api'],
      notes: ['Removes the calling user\'s cached token'],
      response: {
        status: {
          204: undefined
        }
      }
    },
    handler: async (request, h) => {
      const { username } = getCallingUser(request)

      await drop(request, username)

      console.info('Hash Key deleted for user')

      return h.response(undefined).code(204)
    }
  },
  {
    method: 'POST',
    path: '/user/me/feedback',
    options: {
      tags: ['api'],
      notes: ['Receives user feedback and forwards to Defra'],
      response: {
        status: {
          200: userStringResponseSchema
        }
      },
      validate: {
        payload: userFeedbackSchema,
        failAction: (_request, h, err) => {
          console.error('Error validating feedback payload', err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const customFields = []
          .concat(request.payload?.fields.map(field => ({
            name: field.name,
            value: field.value
          })))

        const data = {
          toAddress: config.userFeedbackEmailAddress,
          type: emailTypes.feedback,
          customFields
        }

        await sendEmail(data)

        return h.response({ result: 'Ok' }).code(200)
      }
    }
  }
]
