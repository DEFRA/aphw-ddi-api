const damerauLevenshtein = require('talisman/metrics/damerau-levenshtein')
const { matchingResultFields, importantDogFields } = require('../constants/search')
const { getFieldValue } = require('../lib/field-helpers')

const exactMatch = (word) => {
  return word.searchType === 'dog' && importantDogFields.includes(word.fieldName)
    ? word.exactMatchWeighting * 2
    : word.exactMatchWeighting
}

const closeMatch = (word, dist) => {
  const weight = ((word.value.length - dist) / word.value.length) * word.closeMatchWeighting
  return word.searchType === 'dog' && importantDogFields.includes(word.fieldName)
    ? weight * 2
    : weight
}

const rankWord = (term, word) => {
  if (word?.value && word.value !== '') {
    const termDist = damerauLevenshtein(term.toLowerCase(), word.value.toLowerCase())
    if (termDist < term.length / 3) {
      if (termDist === 0) {
        return exactMatch(word)
      } else {
        return closeMatch(word, termDist)
      }
    }
  }
  return 0
}

const rankResult = (terms, foundRow, searchType) => {
  let rank = 0
  terms.forEach(term => {
    for (let fieldNum = 0; fieldNum < matchingResultFields.length; fieldNum++) {
      const { fieldName, exactMatchWeighting, closeMatchWeighting } = matchingResultFields[fieldNum]
      let fieldValue = getFieldValue(foundRow.json, fieldName)
      if (fieldValue) {
        if (fieldName.indexOf('postcode') > -1) {
          fieldValue = fieldValue.replace(' ', '')
        }
        // Tokenise field value in case multiple words
        const words = `${fieldValue}`.split(' ')
        for (let wordNum = 0; wordNum < words.length; wordNum++) {
          const wordVal = words[wordNum]
          const wordRank = rankWord(term, { value: wordVal, exactMatchWeighting, closeMatchWeighting, searchType, fieldName })
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
