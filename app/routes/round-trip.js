module.exports = {
  method: 'GET',
  path: '/round-trip',
  handler: async (request, h) => {
    // Dummy round-trip to fire auth validation
    console.log('round-trip')
    return h.response().code(200)
  }
}
