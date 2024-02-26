module.exports = {
  method: 'GET',
  path: '/healthz',
  options: { tags: ['api'] },
  handler: (request, h) => {
    return h.response('ok').code(200)
  }
}
