const { buildAddressForSearchResults } = require('../../lib/address-helper')

const groupBy = (list, keyGetter) => {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

const groupOwners = results => {
  if (!results || results.length === 0) {
    return []
  }

  const owners = groupBy(results, x => x.personId)

  return Array.from(owners, ([, value]) => ({
    personId: value[0].personId,
    personReference: value[0].personReference,
    firstName: value[0].firstName,
    lastName: value[0].lastName,
    rank: value[0].rank,
    distance: value[0].distance,
    address: buildAddressForSearchResults(value[0].address),
    dogs: value.map(y => ({
      dogId: y.dogId,
      dogIndex: y.dogIndex,
      dogName: y.dogName,
      microchipNumber: y.microchipNumber,
      dogStatus: y.dogStatus
    }))
  }))
}

const sortDogSearch = (a, b) => {
  return a.distance - b.distance || b.rank - a.rank || a.dogId - b.dogId
}

const sortOwnerSearch = (a, b) => {
  return a.distance - b.distance || b.rank - a.rank || alphaSort(`${a.lastName} ${a.firstName}`, `${b.lastName} ${b.firstName}`)
}

const alphaSort = (a, b) => {
  if (a > b) { return -1 }
  if (a < b) { return 1 }
  return 0
}

const sortAndGroupResults = (mappedResults, type) => {
  if (type === 'dog') {
    return mappedResults.sort(sortDogSearch)
  } else if (type === 'owner') {
    // Owner
    const groupedResults = groupOwners(mappedResults)
    return groupedResults.sort(sortOwnerSearch)
  }
}

module.exports = {
  groupOwners,
  sortDogSearch,
  sortOwnerSearch,
  sortAndGroupResults
}
