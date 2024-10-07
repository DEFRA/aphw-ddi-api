const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { thresholds, maxResults } = require('../constants/search')
const { sortAndGroupResults } = require('./search-processors/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search-processors/search-terms')
const { mapResults } = require('./search-processors/search-results')
const { fuzzySearch } = require('../repos/search-match-codes')
const { trigramSearch } = require('../repos/search-tgrams')
const { rankResult } = require('../repos/search-rank')
const { buildTsVectorQuery } = require('./search-processors/search-builder')

const rankAndKeep = (results, terms, threshold, type) => {
  const numRecords = results.length

  const adjustedThreshold = numRecords < 11 ? threshold / 2 : threshold

  const mappedResults = results
    .map(res => ({ ...res, rank: rankResult(terms, res, type) }))
    .filter(res => res.rank >= adjustedThreshold)

  return mappedResults
}

const doFullTextSearch = async (terms, type, fuzzy) => {
  const termsQuery = buildTsVectorQuery(terms, fuzzy)

  const results = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    },
    raw: true
  })

  // console.log('textFirstPass', results.length)

  return rankAndKeep(results, terms, thresholds.fullTextRankThreshold, type)
}

const doFuzzySearch = async (terms, type) => {
  const fuzzyPersonIds = await fuzzySearch(terms)

  const results = await sequelize.models.search_index.findAll({
    where: {
      person_id: fuzzyPersonIds
    },
    raw: true
  })

  // console.log('fuzzyFirstPass', results.length)

  return rankAndKeep(results, terms, thresholds.fuzzyRankThreshold, type)
}

const microchipRegex = /\d{14,15}/

const doTrigramSearch = async (terms, type) => {
  const adjustedThreshold = terms.length === 1 && microchipRegex.test(terms[0]) ? thresholds.trigramQueryMicrochipThreshold : thresholds.trigramQueryThreshold

  const { uniquePersons, uniqueDogs } = await trigramSearch(terms, adjustedThreshold)

  const results = await sequelize.models.search_index.findAll({
    where: {
      [Op.or]: [
        { person_id: uniquePersons },
        { dog_id: uniqueDogs }
      ]
    },
    raw: true
  })

  // console.log('trigramFirstPass', results.length)

  return rankAndKeep(results, terms, thresholds.trigramRankThreshold, type)
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

const resultsModel = (results, totalFound) => {
  return {
    totalFound,
    results
  }
}

const search = async (type, terms, fuzzy = false) => {
  if (terms === null || terms === undefined) {
    return resultsModel([], 0)
  }

  const termsArray = cleanupSearchTerms(terms)

  const fullTextToKeep = await doFullTextSearch(termsArray, type, fuzzy)

  const fuzzyToKeep = fuzzy ? await doFuzzySearch(termsArray, type) : []

  const trigramToKeep = fuzzy ? await doTrigramSearch(termsArray, type) : []

  // console.log('fullTextToKeep', fullTextToKeep.length)
  // console.log('fuzzyToKeep', fuzzyToKeep.length)
  // console.log('trigramToKeep', trigramToKeep.length)

  const results = combineQueryResults(fullTextToKeep, fuzzyToKeep, trigramToKeep)
  const mappedResults = mapResults(results, type)
  const sortedResults = sortAndGroupResults(mappedResults, type)

  return resultsModel(
    sortedResults.length > maxResults ? sortedResults.slice(0, maxResults) : sortedResults,
    sortedResults.length ?? 0
  )
}

module.exports = {
  search
}
