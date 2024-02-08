const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { sortAndGroupResults } = require('./search/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search/search-terms')
const { mapResults } = require('./search/search-results')

const search = async (type, terms) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = cleanupSearchTerms(terms)
  const termsQuery = termsArray.join(' & ')
  const rankFunc = [sequelize.fn('ts_rank(search_index.search, to_tsquery', sequelize.literal(`'${termsQuery}')`)), 'rank']

  const results = await sequelize.models.search_index.findAll({
    attributes: { include: [rankFunc] },
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
  })

  const mappedResults = mapResults(results, type, termsQuery)

  return sortAndGroupResults(mappedResults, type)
}

module.exports = {
  search
}
