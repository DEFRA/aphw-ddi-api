const { hashCache } = require('../session/hashCache')
const { userValidateAudit, userLogoutAudit } = require('../dto/auditing/user')
const { userVerifyLicenceAccepted, userSetLicenceAccepted } = require('../dto/licence')
const { createAccount } = require('../repos/user-accounts')
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
          200: undefined,
          401: undefined,
          404: undefined
        }
      }
    },
    handler: async (request, h) => {
      const res = await userVerifyLicenceAccepted(request)

      return h.response(res).code(200)
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
          200: undefined,
          500: undefined
        }
      }
    },
    handler: async (request, h) => {
      const res = await userSetLicenceAccepted(request)

      return h.response(res).code(res ? 200 : 500)
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
      const username = request.headers['ddi-username']
      hashCache.delete(username)

      console.info('Hash Key deleted for user')

      await userLogoutAudit(request)

      return h.response(undefined).code(204)
    }
  }
]
