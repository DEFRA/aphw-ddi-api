const { populateMatchCodes } = require('../repos/search-match-codes')
const { populateTrigrams } = require('../repos/search-tgrams')

module.exports = {
  method: 'GET',
  path: '/prepop-codes',
  handler: async (request, h) => {
    await populateMatchCodes()
    await populateTrigrams()

    return h.response('ok').code(200)
  }
}
