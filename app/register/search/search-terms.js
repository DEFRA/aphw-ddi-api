const cleanupSearchTerms = (terms) => {
  const cleaned = addFullDogIndexIfMissing(terms.replaceAll('  ', ' ').replaceAll('*', ':*').split(' '))
  return addJoinedPostcode(cleaned)
}

const addFullDogIndexIfMissing = arr => {
  return arr.map(elem => {
    return ((elem.length === 5 || elem.length === 6) && /^\d+$/.test(elem)) ? `ed${elem}` : elem
  })
}

// Look for two short adjacent search terms and join as if a single postcode
const addJoinedPostcode = terms => {
  let found1pos = -1
  let found2pos = -1
  if (terms.length > 1) {
    for (let termNum = 0; termNum < terms.length; termNum++) {
      const term = terms[termNum]
      if (term.length >= 3 && term.length <= 4) {
        if (found1pos === -1) {
          found1pos = termNum
        } else if (found2pos === -1) {
          found2pos = termNum
          break
        }
      }
    }
    if (found1pos > -1 && found2pos > -1 && (found2pos - found1pos === 1)) {
      return terms.concat([`${terms[found1pos]}${terms[found2pos]}`])
    }
  }
  return terms
}

module.exports = {
  cleanupSearchTerms,
  addFullDogIndexIfMissing
}
