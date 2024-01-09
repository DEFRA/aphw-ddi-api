const sequelize = require('../config/db')
const { Op } = require('sequelize')
const levenshtein = require('js-levenshtein')
const { buildAddressForSearchResults } = require('../lib/address-helper')

const search = async (type, terms) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = terms.replaceAll('  ', ' ').replaceAll('*', ':*').split(' ')
  const termsQuery = termsArray.join(' & ')
  const rankFunc = [sequelize.fn('ts_rank(search_index.search, to_tsquery', sequelize.literal(`'${termsQuery}')`)), 'rank']
  const results = await sequelize.models.search_index.findAll({
    attributes: { include: [rankFunc] },
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
  })

  const mappedResults = results.map(x => {
    const res = x.json
    res.dogId = x.dog_id
    res.personId = x.person_id
    res.distance = type === 'dog' ? levenshtein(x.json.dogName, termsQuery) : levenshtein(`${x.json.firstName} ${x.json.lastName}`, termsQuery)
    res.rank = x.rank ?? x.dataValues.rank
    return res
  })

  if (type === 'dog') {
    return mappedResults.sort(sortDogSearch)
  } else if (type === 'owner') {
    // Owner
    const groupedResults = groupOwners(mappedResults)
    return groupedResults.sort(sortOwnerSearch)
  }
}

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

  const groupedResults = []
  owners.forEach((value, key) => {
    groupedResults.push({
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
      })
      )
    })
  })
  return groupedResults
}

const sortDogSearch = (a, b) => {
  return a.distance - b.distance || b.rank - a.rank || a.dogId - b.dogId
}

const sortOwnerSearch = (a, b) => {
  return a.distance - b.distance || b.rank - a.rank || `${a.lastName} ${a.firstName}` - `${b.lastName} ${b.firstName}`
}

module.exports = {
  search
}
