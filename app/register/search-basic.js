const sequelize = require('../config/db')
const { Op } = require('sequelize')
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
    },
    order: [['rank', 'DESC']]
  })

  // console.log('result1', JSON.parse(JSON.stringify(results)))
  // TODO - if dog search, and dog name matches criteria, display at top of list
  //      - if owner search, and owner name matches criteria, display at top of list
  // ??? use levenshtein on mapped results?
  const mappedResults = results.map(x => {
    const res = x.json
    res.dogId = x.dog_id
    res.personId = x.person_id
    return res
  })

  if (type === 'dog') {
    return mappedResults
  } else if (type === 'owner') {
    // Owner
    const groupedResults = groupOwners(mappedResults)
    return groupedResults
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

module.exports = {
  search
}
