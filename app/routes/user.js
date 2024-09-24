const { hashCache } = require('../session/hashCache')
const { userValidateAudit, userLogoutAudit } = require('../dto/auditing/user')
const { userVerifyLicenceAccepted, userSetLicenceAccepted } = require('../dto/licence')

module.exports = [
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

      return h.response(undefined).code(res ? 200 : 404)
    }
  },
  {
    method: 'PUT',
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
      const res = await userSetLicenceAccepted(request)

      return h.response(undefined).code(res ? 200 : 404)
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
