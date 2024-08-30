const { hashCache } = require('../session/hashCache')

module.exports = {
  method: 'DELETE',
  path: '/user/cache/my',
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

    return h.response(undefined).code(204)
  }
}
