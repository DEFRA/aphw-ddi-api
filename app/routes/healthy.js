module.exports = {
  method: 'GET',
  path: '/healthy',
  handler: async (request, h) => {   
    return h.response('ok').code(200)
  }
}
