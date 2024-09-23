const mapResults = (results, type) => {
  return results.map(x => {
    const res = x.json
    res.dogId = x.dog_id
    res.personId = x.person_id
    res.rank = x.rank
    res.searchType = type
    return res
  })
}

module.exports = {
  mapResults
}
