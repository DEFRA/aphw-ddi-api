const { MINUTE } = require('../../constants/time')
const { addMinutes } = require('../../lib/date-helpers')
const { get, set } = require('../../cache')

const resultsPerPage = 20
const expiryPeriodInMins = MINUTE * 65

const buildSearchCacheKey = (user, request) => {
  return `${user?.username}|${request.params?.terms}|${request.query?.fuzzy ?? 'false'}|${request.query?.global ?? 'false'}`
}

const resultsModel = (status, results, totalFound, page) => {
  return {
    status,
    results,
    totalFound,
    page
  }
}

const getPageNum = (request) => {
  const pageNum = parseInt(request.query?.page) ?? 1
  return isNaN(pageNum) ? 1 : pageNum
}

const getPageFromCache = async (user, request) => {
  const cacheKey = buildSearchCacheKey(user, request)
  const cached = await get(request, cacheKey)

  const pageNum = getPageNum(request)

  const now = new Date()

  if (cached) {
    if (new Date(cached.expiry).getTime() > now.getTime()) {
      // Valid result
      return resultsModel(200, cached.results.results.splice((pageNum - 1) * resultsPerPage, resultsPerPage), cached.results.totalFound, pageNum)
    }
  }

  return resultsModel(404, [], 0)
}

const saveResultsToCacheAndGetPageOne = async (user, request, results) => {
  const cacheKey = buildSearchCacheKey(user, request)
  const now = new Date()
  await set(request, cacheKey, { results, expiry: addMinutes(now, expiryPeriodInMins) }, expiryPeriodInMins * MINUTE)
  return resultsModel('ok', results.results?.splice(0, 25), results.totalFound, 1)
}

module.exports = {
  buildSearchCacheKey,
  getPageFromCache,
  saveResultsToCacheAndGetPageOne
}
