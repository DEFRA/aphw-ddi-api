module.exports = {
  method: 'GET',
  path: '/healthy',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    return h.response('ok').code(200)
  }
}
