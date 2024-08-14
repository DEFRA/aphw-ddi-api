const { populateTrigrams } = require('../repos/match-codes')
// const { populateMatchCodes } = require('../repos/match-codes')

module.exports = {
  method: 'GET',
  path: '/prepop-codes',
  handler: async (request, h) => {
    // await populateMatchCodes()
    await populateTrigrams()

    return h.response('ok').code(200)
  }
}
