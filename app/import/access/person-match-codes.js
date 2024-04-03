const fuzzyAlgo1 = require('talisman/phonetics/daitch-mokotoff')
const nysiis = require('talisman/phonetics/nysiis')
const fuzzyAlgo2 = nysiis.refined

const generatePersonMatchCodes = (person, config) => {
  config = config || { includeSwappedNames: false, includeFuzzyAlgo1: false, includeFuzzyAlgo2: false }
  const matchCodes = []
  const firstName = person.first_name.toLowerCase()
  const lastName = person.last_name.toLowerCase()

  const addressLine1 = person.address_line_1?.toLowerCase()
  const postcode = person.postcode?.toLowerCase()

  matchCodes.push(`${firstName}^${lastName}^${addressLine1}^${postcode}`)
  if (config.includeSwappedNames) {
    matchCodes.push(`${lastName}^${firstName}`)
  }

  // Algorithm 1 (daitch-mokotoff) can yield multiple codes per result
  if (config.includeFuzzyAlgo1) {
    addMultiCombinations(matchCodes, fuzzyAlgo1(firstName), fuzzyAlgo1(lastName))
    if (config.includeSwappedNames) {
      addMultiCombinations(matchCodes, fuzzyAlgo1(lastName), fuzzyAlgo1(firstName))
    }
  }

  // Algorithm 2 (nysiis) only yields single codes per result
  if (config.includeFuzzyAlgo2) {
    matchCodes.push(`${fuzzyAlgo2(firstName)}^${fuzzyAlgo2(lastName)}`)
    if (config.includeSwappedNames) {
      matchCodes.push(`${fuzzyAlgo2(lastName)}^${fuzzyAlgo2(firstName)}`)
    }
  }

  return matchCodes
}

const addMultiCombinations = (matchCodes, firstNameCodes, lastNameCodes) => {
  for (const firstNameCode of firstNameCodes) {
    for (const lastNameCode of lastNameCodes) {
      matchCodes.push(`${firstNameCode}^${lastNameCode}`)
    }
  }
}

module.exports = generatePersonMatchCodes
