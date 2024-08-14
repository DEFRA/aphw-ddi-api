const sequelize = require('../config/db')
const fuzzyAlgo1 = require('talisman/phonetics/daitch-mokotoff')
const levenshtein = require('talisman/metrics/levenshtein')
// const nysiis = require('talisman/phonetics/nysiis')
// const fuzzyAlgo2 = nysiis.refined

const matchCodesForTerm = (term) => {
  return fuzzyAlgo1(term.toLowerCase())
}

const searchFields = [
  { fieldName: 'firstName' },
  { fieldName: 'lastName' },
  { fieldName: 'email' },
  { fieldName: 'address.town' }
]

const matchingResultFields = [
  { fieldName: 'firstName', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'lastName', exactMatchWeighting: 4, closeMatchWeighting: 2 },
  { fieldName: 'email', exactMatchWeighting: 4, closeMatchWeighting: 3 },
  { fieldName: 'address.address_line_1', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'address.address_line_2', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'address.town', exactMatchWeighting: 2, closeMatchWeighting: 2 },
  { fieldName: 'address.postcode', exactMatchWeighting: 4, closeMatchWeighting: 3 },
  { fieldName: 'dogName', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'microchipNumber', exactMatchWeighting: 6, closeMatchWeighting: 3 },
  { fieldName: 'microchipNumber2', exactMatchWeighting: 6, closeMatchWeighting: 3 }
]

const getFieldValue = (dataRow, fieldName) => {
  if (fieldName.indexOf('.') > -1) {
    return dataRow[fieldName.substr(0, fieldName.indexOf('.'))][fieldName.substr(fieldName.indexOf('.') + 1)]
  }
  return dataRow[fieldName]
}

const populateMatchCodes = async () => {
  const searchRows = await sequelize.models.search_index.findAll()

  for (let rowNum = 0; rowNum < searchRows.length; rowNum++) {
    const searchRow = searchRows[rowNum]
    for (let fieldNum = 0; fieldNum < searchFields.length; fieldNum++) {
      const fieldName = searchFields[fieldNum].fieldName
      const fieldValue = getFieldValue(searchRow.json, fieldName)
      if (fieldValue) {
        const codes = matchCodesForTerm(fieldValue)
        for (let c = 0; c < codes.length; c++) {
          await sequelize.models.match_code.create({
            person_id: searchRow.person_id,
            match_code: codes[c]
          })
        }
      }
    }
  }
}

const buildFuzzyCodes = (terms) => {
  const fuzzyCodes = []
  terms.forEach(term => {
    const matchCodes = matchCodesForTerm(term)
    matchCodes.forEach(code => fuzzyCodes.push(code))
  })
  return fuzzyCodes
}

const exactMatch = (word) => {
  return word.searchType === 'dog' && word.fieldName === 'dogName'
    ? word.exactMatchWeighting * 2
    : word.exactMatchWeighting
}

const closeMatch = (word, dist) => {
  const weight = ((word.value.length - dist) / word.value.length) * word.closeMatchWeighting
  return word.searchType === 'dog' && word.fieldName === 'dogName'
    ? weight * 2
    : weight
}

const rankWord = (term, word) => {
  if (word?.value && word.value !== '') {
    const termDist = levenshtein(term.toLowerCase(), word.value.toLowerCase())
    if (termDist < term.length / 3) {
      // console.log(`termDist****Match <${fieldName}> <${fieldValue}> ${foundRow.json.firstName} ${foundRow.json.lastName}`)
      // console.log('termDist', termDist)
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
        const words = fieldValue.split(' ')
        for (let wordNum = 0; wordNum < words.length; wordNum++) {
          const wordVal = words[wordNum]
          rank += rankWord(term, { value: wordVal, exactMatchWeighting, closeMatchWeighting, searchType, fieldName })
        }
      }
    }
  })
  return rank
}

const fuzzySearch = async (terms) => {
  const fuzzyCodes = buildFuzzyCodes(terms)
  const fuzzyResults = await sequelize.models.match_code.findAll({
    where: {
      match_code: fuzzyCodes
    }
  })
  const uniquePersons = []
  fuzzyResults.forEach(res => {
    if (!uniquePersons.includes(res.person_id)) {
      uniquePersons.push(res.person_id)
    }
  })
  return uniquePersons
}

module.exports = {
  populateMatchCodes,
  matchCodesForTerm,
  fuzzySearch,
  rankResult
}
