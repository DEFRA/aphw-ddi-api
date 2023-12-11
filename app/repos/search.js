const sequelize = require('../config/db')

const addToSearchIndex = async (person, dog, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => addToSearchIndex(person, dog, t))
  }

  await sequelize.models.search_index.create({
    search: sequelize.fn('to_tsvector', `${person.id} ${person.first_name} ${person.last_name} ${buildAddress(person.address)} ${dog.index_number} ${dog.name} ${dog.microchip_number}`),
    person_id: person.id,
    dog_id: dog.id,
    json: {
      firstName: person.first_name,
      lastName: person.last_name,
      address: buildAddress(person.addresses),
      dogIndex: dog.index_number,
      dogName: dog.name,
      microchipNumber: dog.microchip_number
    }
  }, { transaction })
}

const buildAddress = (addresses) => {
  const addrParts = []
  if (addresses?.address?.address_line_1) {
    addrParts.push(addresses.address.address_line_1)
  }
  if (addresses?.address?.address_line_2) {
    addrParts.push(addresses.address.address_line_2)
  }
  if (addresses?.address?.town) {
    addrParts.push(addresses.address.town)
  }
  if (addresses?.address?.postcode) {
    addrParts.push(addresses.address.postcode)
  }
  return addrParts.join(', ')
}

module.exports = {
  addToSearchIndex
}
