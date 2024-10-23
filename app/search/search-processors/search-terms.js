const cleanupSearchTerms = (terms) => {
  const cleaned = addFullDogIndexIfMissing(terms.replaceAll('  ', ' ').replaceAll('*', ':*').split(' '))
  return addJoinedPostcode(cleaned)
}

const addFullDogIndexIfMissing = arr => {
  return arr.map(elem => {
    return ((elem.length === 5 || elem.length === 6) && /^\d+$/.test(elem)) ? `ed${elem}` : elem
  })
}

const postcodeRegexPart1 = /^([A-Za-z]{1,2}\d{1,2})$/
const postcodeRegexPart2 = /^(\d[A-Za-z]{2})$/

// Look for two short adjacent search terms and join as if a single postcode
const addJoinedPostcode = terms => {
  let found1pos = -1
  let found2pos = -1
  if (terms.length > 1) {
    for (let termNum = 0; termNum < terms.length; termNum++) {
      const term = terms[termNum]
      if (postcodeRegexPart1.test(term)) {
        found1pos = termNum
      } else if (postcodeRegexPart2.test(term)) {
        found2pos = termNum
        break
      }
    }
    if (found1pos > -1 && found2pos > -1 && (found2pos - found1pos === 1)) {
      return [`${terms[found1pos]}${terms[found2pos]}`].concat(terms)
    }
  }
  return terms
}

module.exports = {
  cleanupSearchTerms,
  addFullDogIndexIfMissing,
  addJoinedPostcode
}
