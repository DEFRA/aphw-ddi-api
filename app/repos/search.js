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
      address: buildAddress(person),
      dogIndex: dog.index_number,
      dogName: dog.name,
      microchipNumber: dog.microchip_number
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
  }
  return addrParts.join(', ')
}

module.exports = {
  addToSearchIndex
}
