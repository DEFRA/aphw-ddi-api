const sequelize = require('../config/db')
const { dbFindByPk } = require('../lib/db-functions')

const addToSearchIndex = async (person, dogId, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => addToSearchIndex(person, dogId, t))
  }

  const dog = await dbFindByPk(sequelize.models.dog, dogId, { raw: true, nest: true, transaction })

  await sequelize.models.search_index.create({
    search: sequelize.fn('to_tsvector', `${person.person_reference} ${person.first_name} ${person.last_name} ${buildAddress(person)} ${dog.index_number} ${dog.name} ${dog.microchip_number}`),
    person_id: person.id,
    dog_id: dog.id,
    json: {
      firstName: person.first_name,
      lastName: person.last_name,
      address: buildAddress(person),
      dogIndex: dog.index_number,
      dogName: dog.name,
      microchipNumber: dog.microchip_number,
      personReference: person.person_reference
    }
  }, { transaction })
}

const buildAddress = (person) => {
  const address = person?.addresses?.address ? person.addresses.address : person.address
  const addrParts = []
  if (address?.address_line_1) {
    addrParts.push(address.address_line_1)
  }
  if (address?.address_line_2) {
    addrParts.push(address.address_line_2)
  }
  if (address?.town) {
    addrParts.push(address.town)
  }
  if (address?.postcode) {
    addrParts.push(address.postcode)
    if (address.postcode.indexOf(' ') > -1) {
      addrParts.push(address.postcode.replaceAll(' ', ''))
    }
  }
  return addrParts.join(', ')
}

module.exports = {
  addToSearchIndex,
  buildAddress
}
