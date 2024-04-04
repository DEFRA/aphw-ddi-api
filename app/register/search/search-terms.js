const cleanupSearchTerms = (terms) => {
  return addFullDogIndexIfMissing(terms.replaceAll('  ', ' ').replaceAll('*', ':*').split(' '))
}

const addFullDogIndexIfMissing = arr => {
  return arr.map(elem => {
    return ((elem.length === 5 || elem.length === 6) && /^\d+$/.test(elem)) ? `ed${elem}` : elem
  })
}

module.exports = {
  cleanupSearchTerms,
  addFullDogIndexIfMissing
}
