const { hashCache } = require('../session/hashCache')
const { userValidateAudit, userLogoutAudit } = require('../dto/auditing/user')
const { getRegistrationService } = require('../service/config')
const { userBooleanResponseSchema, userStringResponseSchema } = require('../schema/user')
const { userVerifyLicenceAccepted, userSetLicenceAccepted } = require('../dto/licence')
const { createAccount, deleteAccount } = require('../repos/user-accounts')
const { scopes } = require('../constants/auth')
const { createUserResponseSchema, createUserRequestSchema } = require('../schema/user')
const { mapUserDaoToDto } = require('../dto/mappers/user')
const { conflictSchema } = require('../schema/common/response/conflict')
const { notFoundSchema } = require('../schema/common/response/not-found')
const { getCallingUser } = require('../auth/get-user')

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
    method: 'DELETE',
    path: '/user/{userId?}',
    options: {
      tags: ['api'],
      notes: ['Deletes a user account'],
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
      await userValidateAudit(request)

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

      hashCache.delete(username)

      console.info('Hash Key deleted for user')

      await userLogoutAudit(request)

      return h.response(undefined).code(204)
    }
  }
]
