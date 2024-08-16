const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { sortAndGroupResults } = require('./search/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search/search-terms')
const { mapResults } = require('./search/search-results')
const { fuzzySearch, rankResult, trigramSearch } = require('../repos/search-match-codes')
const { buildTsVectorQuery } = require('./search/search-builder')

const trigramQueryThreshold = 0.4
const trigramRankThreshold = 1.001
const fuzzyRankThreshold = 1.001
const fullTextRankThreshold = 1.01

const rankAndKeep = (results, terms, threshold, type) => {
  const toKeep = []

  results.forEach(res => {
    res.rank = rankResult(terms, res, type)
    if (res.rank >= threshold) {
      toKeep.push(res)
    }
  })

  return toKeep
}

const doFullTextSearch = async (terms, type, fuzzy) => {
  const termsQuery = buildTsVectorQuery(terms, fuzzy)

  const results = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
  })

  console.log('fullTextFirstPass', results.length)

  return rankAndKeep(results, terms, fullTextRankThreshold, type)
}

const doFuzzySearch = async (terms, type) => {
  const fuzzyPersonIds = await fuzzySearch(terms)

  const results = await sequelize.models.search_index.findAll({
    where: {
      person_id: fuzzyPersonIds
    }
  })

  console.log('fuzzyFirstPass', results.length)

  return rankAndKeep(results, terms, fuzzyRankThreshold, type)
}

const doTrigramSearch = async (terms, type) => {
  const { uniquePersons, uniqueDogs } = await trigramSearch(terms, trigramQueryThreshold)

  const results = await sequelize.models.search_index.findAll({
    where: {
      [Op.or]: [
        { person_id: uniquePersons },
        { dog_id: uniqueDogs }
      ]
    }
  })

  console.log('trigramFirstPass', results.length)

  return rankAndKeep(results, terms, trigramRankThreshold, type)
}

const combineQueryResults = (res1, res2, res3) => {
  const uniqueResults = []
  const uniqueResultIds = []

  const results = res1.concat(res2).concat(res3)

  results.forEach(res => {
    if (res.id && !uniqueResultIds.includes(res.id)) {
      uniqueResultIds.push(res.id)
      uniqueResults.push(res)
    }
  })

  return uniqueResults
}

const search = async (type, terms, fuzzy = false) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = cleanupSearchTerms(terms)
  console.log('termsArray', termsArray)

  const fullTextToKeep = await doFullTextSearch(termsArray, type, fuzzy)

  const fuzzyToKeep = fuzzy ? await doFuzzySearch(termsArray, type) : []

  const trigramToKeep = fuzzy ? await doTrigramSearch(termsArray, type) : []

  console.log('fullTextToKeep', fullTextToKeep.length)
  console.log('fuzzyToKeep', fuzzyToKeep.length)
  console.log('trigramToKeep', trigramToKeep.length)

  const results = combineQueryResults(fullTextToKeep, fuzzyToKeep, trigramToKeep)
  const mappedResults = mapResults(results, type)

  return sortAndGroupResults(mappedResults, type)
}

module.exports = {
  search
}
