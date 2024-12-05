const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { thresholds } = require('../constants/search')
const { sortAndGroupResults } = require('./search-processors/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search-processors/search-terms')
const { mapResults } = require('./search-processors/search-results')
const { fuzzySearch } = require('../repos/search-match-codes')
const { trigramSearch } = require('../repos/search-tgrams')
const { rankResult } = require('../repos/search-rank')
const { buildTsVectorQuery } = require('./search-processors/search-builder')
const { getUsersForceList } = require('../repos/police-force-helper')

const rankAndKeep = (results, terms, threshold, type) => {
  const numRecords = results.length

  const adjustedThreshold = numRecords < 11 ? threshold / 2 : threshold

  const mappedResults = results
    .map(res => ({ ...res, rank: rankResult(terms, res, type) }))
    .filter(res => res.rank >= adjustedThreshold)

  return mappedResults
}

const doFullTextSearch = async (terms, type, fuzzy, policeForceIds) => {
  const termsQuery = buildTsVectorQuery(terms, fuzzy)

  let whereClause = { search: { [Op.match]: sequelize.fn('to_tsquery', termsQuery) } }

  if (policeForceIds) {
    whereClause = { ...whereClause, police_force_id: policeForceIds }
  }

  const results = await sequelize.models.search_index.findAll({
    where: whereClause,
    raw: true
  })

  return rankAndKeep(results, terms, thresholds.fullTextRankThreshold, type)
}

const doFuzzySearch = async (terms, type, policeForceIds) => {
  const fuzzyPersonIds = await fuzzySearch(terms)

  let whereClause = { person_id: fuzzyPersonIds }

  if (policeForceIds) {
    whereClause = { ...whereClause, police_force_id: policeForceIds }
  }

  const results = await sequelize.models.search_index.findAll({
    where: whereClause,
    raw: true
  })

  return rankAndKeep(results, terms, thresholds.fuzzyRankThreshold, type)
}

const microchipRegex = /\d{14,15}/

const doTrigramSearch = async (terms, type, policeForceIds) => {
  const adjustedThreshold = terms.length === 1 && microchipRegex.test(terms[0]) ? thresholds.trigramQueryMicrochipThreshold : thresholds.trigramQueryThreshold

  const { uniquePersons, uniqueDogs } = await trigramSearch(terms, adjustedThreshold)

  let whereClause = {
    [Op.or]: [
      { person_id: uniquePersons },
      { dog_id: uniqueDogs }
    ]
  }

  if (policeForceIds) {
    whereClause = { ...whereClause, police_force_id: policeForceIds }
  }

  const results = await sequelize.models.search_index.findAll({
    where: whereClause,
    raw: true
  })

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

const search = async (request, user, type, terms, fuzzy = false, national = false) => {
  if (terms === null || terms === undefined) {
    return resultsModel([], 0)
  }

  const termsArray = cleanupSearchTerms(terms)

  const policeForceIds = national ? undefined : await getUsersForceList(user, request)

  const fullTextToKeep = await doFullTextSearch(termsArray, type, fuzzy, policeForceIds)

  const fuzzyToKeep = fuzzy ? await doFuzzySearch(termsArray, type, policeForceIds) : []

  const trigramToKeep = fuzzy ? await doTrigramSearch(termsArray, type, policeForceIds) : []

  const results = combineQueryResults(fullTextToKeep, fuzzyToKeep, trigramToKeep)
  const mappedResults = mapResults(results, type)
  const sortedResults = sortAndGroupResults(mappedResults, type)

  return resultsModel(
    sortedResults,
    sortedResults.length ?? 0
  )
}

module.exports = {
  search
}
