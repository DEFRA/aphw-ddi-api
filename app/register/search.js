const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { sortAndGroupResults } = require('./search/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search/search-terms')
const { mapResults } = require('./search/search-results')
const { fuzzySearch, rankResult } = require('../repos/match-codes')

const buildSearchQuery = (terms, fuzzy) => {
  const expandedTerms = []
  terms.forEach(term => {
    expandedTerms.push(fuzzy ? `"${term}":*` : term)
  })
  return expandedTerms.join(fuzzy ? ' | ' : ' & ')
}

const doFullTextSearch = async (terms, type, fuzzy) => {
  const toKeep = []

  const termsQuery = buildSearchQuery(terms, fuzzy)

  const results = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
  })

  results.forEach(res => {
    res.rank = rankResult(terms, res, type)
    if (res.rank >= 1) {
      toKeep.push(res)
    }
  })

  return toKeep
}

const doFuzzySearch = async (terms, type) => {
  const toKeep = []

  const fuzzyPersonIds = await fuzzySearch(terms)

  const results = await sequelize.models.search_index.findAll({
    where: {
      person_id: fuzzyPersonIds
    }
  })

  results.forEach(res => {
    res.rank = rankResult(terms, res, type)
    if (res.rank > 1) {
      toKeep.push(res)
    }
  })

  return toKeep
}

const search = async (type, terms, fuzzy = false) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = cleanupSearchTerms(terms)

  const tsResults = await doFullTextSearch(termsArray, type, fuzzy)

  const fzToKeep = fuzzy ? await doFuzzySearch(termsArray, type) : []

  console.log('tsResults', tsResults.length)
  console.log('fzToKeep', fzToKeep.length)

  const results = tsResults.concat(fzToKeep)
  const mappedResults = mapResults(results, type)

  return sortAndGroupResults(mappedResults, type)
}

module.exports = {
  search
}
