const buildTsVectorQuery = (terms, fuzzy) => {
  const expandedTerms = []
  terms.forEach(term => {
    expandedTerms.push(fuzzy ? `"${term}":*` : term)
  })
  return expandedTerms.join(fuzzy ? ' | ' : ' & ')
}

module.exports = {
  buildTsVectorQuery
}
