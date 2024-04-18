const levenshtein = require('js-levenshtein')

const mapResults = (results, type, termsQuery) => {
  return results.map(x => {
    const res = x.json
    res.dogId = x.dog_id
    res.personId = x.person_id
    res.distance = type === 'dog' ? levenshtein(res.dogName || '', termsQuery) : levenshtein(`${res.firstName} ${res.lastName}`, termsQuery)
    res.rank = x.rank ?? x.dataValues.rank
    return res
  })
}

module.exports = {
  mapResults
}
