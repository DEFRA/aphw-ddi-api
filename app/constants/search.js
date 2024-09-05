const matchCodeSearchFields = [
  { fieldName: 'firstName' },
  { fieldName: 'lastName' },
  { fieldName: 'email', simple: true },
  { fieldName: 'address.town', simple: true }
]

const trigramSearchFields = [
  { fieldName: 'microchipNumber', source: 'dog' },
  { fieldName: 'microchipNumber2', source: 'dog' },
  { fieldName: 'address.postcode', source: 'person' }
]

const matchingResultFields = [
  { fieldName: 'dogIndex', exactMatchWeighting: 10, closeMatchWeighting: 1 },
  { fieldName: 'firstName', exactMatchWeighting: 3, closeMatchWeighting: 1.8 },
  { fieldName: 'lastName', exactMatchWeighting: 4, closeMatchWeighting: 2 },
  { fieldName: 'email', exactMatchWeighting: 4, closeMatchWeighting: 3 },
  { fieldName: 'address.address_line_1', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'address.address_line_2', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'address.town', exactMatchWeighting: 2, closeMatchWeighting: 2 },
  { fieldName: 'address.postcode', exactMatchWeighting: 4, closeMatchWeighting: 2 },
  { fieldName: 'dogName', exactMatchWeighting: 2, closeMatchWeighting: 1 },
  { fieldName: 'microchipNumber', exactMatchWeighting: 6, closeMatchWeighting: 2 },
  { fieldName: 'microchipNumber2', exactMatchWeighting: 6, closeMatchWeighting: 2 }
]

const importantDogFields = ['dogName']

const importantOwnerFields = ['lastName']

const dogFieldsRequiringCloseMatch = ['microchipNumber', 'microchipNumber2']

const thresholds = {
  trigramQueryThreshold: 0.4,
  trigramQueryMicrochipThreshold: 0.55,
  trigramRankThreshold: 1.001,
  fuzzyRankThreshold: 1.001,
  fullTextRankThreshold: 1.01
}

const maxResults = 25

module.exports = {
  matchCodeSearchFields,
  trigramSearchFields,
  matchingResultFields,
  importantDogFields,
  importantOwnerFields,
  dogFieldsRequiringCloseMatch,
  thresholds,
  maxResults
}
