const sequelize = require('../config/db')
const { Op } = require('sequelize')
const fuzzyAlgo1 = require('talisman/phonetics/daitch-mokotoff')
const damerauLevenshtein = require('talisman/metrics/damerau-levenshtein')

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
  { fieldName: 'address.postcode', exactMatchWeighting: 2, closeMatchWeighting: 1.5 },
  { fieldName: 'dogName', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'microchipNumber', exactMatchWeighting: 6, closeMatchWeighting: 3 },
  { fieldName: 'microchipNumber2', exactMatchWeighting: 6, closeMatchWeighting: 3 }
]

const importantDogFields = ['dogName', 'microchipNumber', 'microchipNumber2']

const getFieldValue = (dataRow, fieldName) => {
  if (fieldName.indexOf('.') > -1) {
    return dataRow[fieldName.substr(0, fieldName.indexOf('.'))]?.[fieldName.substr(fieldName.indexOf('.') + 1)]
  }
  return dataRow[fieldName]
}

const populateMatchCodes = async () => {
  const searchRows = await sequelize.models.search_index.findAll()

  await sequelize.models.search_match_code.truncate()

  for (let rowNum = 0; rowNum < searchRows.length; rowNum++) {
    const searchRow = searchRows[rowNum]
    for (let fieldNum = 0; fieldNum < searchFields.length; fieldNum++) {
      const fieldName = searchFields[fieldNum].fieldName
      const fieldValue = getFieldValue(searchRow.json, fieldName)
      if (fieldValue && fieldValue !== '') {
        const codes = matchCodesForTerm(fieldValue)
        for (let c = 0; c < codes.length; c++) {
          await sequelize.models.search_match_code.create({
            person_id: searchRow.person_id,
            match_code: codes[c]
          })
        }
      }
    }
  }
}

const populateTrigrams = async () => {
  const searchRows = await sequelize.models.search_index.findAll()

  await sequelize.models.search_tgram.truncate()

  for (let rowNum = 0; rowNum < searchRows.length; rowNum++) {
    const searchRow = searchRows[rowNum]
    const microchipFieldValue1 = getFieldValue(searchRow.json, 'microchipNumber')
    const microchipFieldValue2 = getFieldValue(searchRow.json, 'microchipNumber2')
    const postcodeFieldValue = getFieldValue(searchRow.json, 'address.postcode')
    if (microchipFieldValue1 && microchipFieldValue1 !== '') {
      await sequelize.models.search_tgram.create({
        dog_id: searchRow.dog_id,
        match_text: `${microchipFieldValue1}`
      })
    }
    if (microchipFieldValue2 && microchipFieldValue2 !== '') {
      await sequelize.models.search_tgram.create({
        dog_id: searchRow.dog_id,
        match_text: `${microchipFieldValue2}`
      })
    }
    if (postcodeFieldValue && postcodeFieldValue !== '') {
      await sequelize.models.search_tgram.create({
        person_id: searchRow.person_id,
        match_text: postcodeFieldValue.replace(' ', '').toLowerCase()
      })
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
  let exactPostcodeMatch = false
  terms.forEach(term => {
    for (let fieldNum = 0; fieldNum < matchingResultFields.length; fieldNum++) {
      const { fieldName, exactMatchWeighting, closeMatchWeighting } = matchingResultFields[fieldNum]
      const fieldValue = getFieldValue(foundRow.json, fieldName)
      if (fieldValue) {
        if (fieldName.indexOf('postcode') > -1) {
          if (exactPostcodeMatch) {
            break
          }
          const joinedFieldValue = fieldValue.replace(' ', '')
          const joinedRank = rankWord(term, { value: joinedFieldValue, exactMatchWeighting, closeMatchWeighting, searchType, fieldName })
          if (joinedRank > 0) {
            rank += joinedRank
            exactPostcodeMatch = true
            break
          }
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

const fuzzySearch = async (terms) => {
  const fuzzyCodes = buildFuzzyCodes(terms)
  const fuzzyResults = await sequelize.models.search_match_code.findAll({
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

const trigramTermQuery = async (term, threshold) => {
  return await sequelize.models.search_tgram.findAll({
    attributes: { include: [[sequelize.fn('similarity', sequelize.col('match_text'), term), 'similarity_score']] },
    where: [sequelize.where(sequelize.fn('similarity', sequelize.col('match_text'), term),
      { [Op.gt]: threshold }
    ),
    {}
    ]
  })
}

const trigramSearch = async (terms, threshold) => {
  const uniquePersons = []
  const uniqueDogs = []

  for (let termNum = 0; termNum < terms.length; termNum++) {
    const term = terms[termNum]

    const results = await trigramTermQuery(term, threshold)

    results.forEach(res => {
      if (res.person_id && !uniquePersons.includes(res.person_id)) {
        uniquePersons.push(res.person_id)
      }
      if (res.dog_id && !uniqueDogs.includes(res.dog_id)) {
        uniqueDogs.push(res.dog_id)
      }
    })
  }
  return { uniquePersons, uniqueDogs }
}

module.exports = {
  populateMatchCodes,
  populateTrigrams,
  fuzzySearch,
  trigramSearch,
  rankResult
}
