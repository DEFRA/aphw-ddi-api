const { hashCache } = require('../session/hashCache')
const { userValidateAudit, userLogoutAudit } = require('../dto/auditing/user')
const { getRegistrationService } = require('../service/config')

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
      const res = await getRegistrationService().isUserLicenceAccepted(request)

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
      const res = await getRegistrationService().setUserLicenceAccepted(request)

      return h.response(res).code(res ? 200 : 500)
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
          200: undefined,
          401: undefined,
          404: undefined
        }
      }
    },
    handler: async (request, h) => {
      const res = await getRegistrationService().isUserEmailVerified(request)

      return h.response(res).code(200)
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
          200: undefined
        }
      }
    },
    handler: async (request, h) => {
      await getRegistrationService().sendVerifyEmail(request)

      return h.response(true).code(200)
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
          200: undefined
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
      const username = request.headers['ddi-username']
      hashCache.delete(username)

      console.info('Hash Key deleted for user')

      await userLogoutAudit(request)

      return h.response(undefined).code(204)
    }
  }
]
