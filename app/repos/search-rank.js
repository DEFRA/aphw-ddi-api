const damerauLevenshtein = require('talisman/metrics/damerau-levenshtein')
const { matchingResultFields, importantDogFields, importantOwnerFields, dogFieldsRequiringCloseMatch } = require('../constants/search')
const { getFieldValue } = require('../lib/field-helpers')

const exactMatch = (word) => {
  return word.searchType === 'dog' && importantDogFields.includes(word.fieldName)
    ? word.exactMatchWeighting * 2
    : word.exactMatchWeighting
}

const closeMatch = (word, dist) => {
  const weight = ((word.value.length - dist) / word.value.length) * word.closeMatchWeighting
  if (word.searchType === 'dog') {
    if (importantDogFields.includes(word.fieldName)) {
      return weight * 2
    }
    if (dogFieldsRequiringCloseMatch.includes(word.fieldName)) {
      return dist < 4 ? weight * 2 : 0
    }
  } else if (word.searchType === 'owner') {
    if (importantOwnerFields.includes(word.fieldName)) {
      return weight * 1.5
    }
  }
  return weight
}

const rankWord = (term, word) => {
  if (word?.value && word.value !== '') {
    const termLower = term.toLowerCase()
    const wordLower = word.value.toLowerCase()
    const termDist = damerauLevenshtein(termLower, wordLower)
    if (termDist <= term.length / 3) {
      if (termDist === 0) {
        return exactMatch(word)
      } else {
        return closeMatch(word, termDist)
      }
    }

    // Check for sub-string
    if (termLower.indexOf(wordLower) > -1 || wordLower.indexOf(termLower) > -1) {
      return termDist < 4 ? 1 : 0
    }
  }
  return 0
}

const rankResult = (terms, foundRow, searchType) => {
  let rank = 0
  const lastNameLower = (getFieldValue(foundRow.json, 'lastName') ?? '').toLowerCase()
  terms.forEach(term => {
    for (const field of matchingResultFields) {
      const { fieldName, exactMatchWeighting, closeMatchWeighting } = field
      let fieldValue = getFieldValue(foundRow.json, fieldName)
      if (fieldValue) {
        fieldValue = `${fieldValue}`.toLowerCase()
        if (fieldName.indexOf('postcode') > -1) {
          fieldValue = fieldValue.replace(' ', '')
        } else if (fieldName === 'dogName' && fieldValue.indexOf(lastNameLower) > -1) {
          fieldValue = fieldValue.replace(lastNameLower, '').trim()
        }
        // Tokenise field value in case multiple words
        const words = `${fieldValue}`.split(' ')
        for (const wordVal of words) {
          const wordRank = rankWord(term, { value: wordVal, exactMatchWeighting, closeMatchWeighting, searchType, fieldName })
          // console.log(`word rank word=${wordVal} term=${term}`, wordRank)
          rank += wordRank
        }
      }
    }
  })
  return rank
}

module.exports = {
  rankResult
}
