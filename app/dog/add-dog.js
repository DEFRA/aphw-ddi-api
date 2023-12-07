const sequelize = require('../config/db')
const { dbCreate } = require('../lib/db-functions')

const addToSearchIndex = async (person, dog, t) => {
  await dbCreate(sequelize.models.search_index, {
    search: sequelize.fn('to_tsvector', `${person.id} ${person.first_name} ${person.last_name} ${buildAddress(person)} ${dog.name} ${dog.microchipNumber}`),
    reference_number: person.id,
    json: {
      firstName: person.first_name,
      lastName: person.last_name,
      address: buildAddress(person),
      dogName: dog.name,
      microchipNumber: dog.microchipNumber
    }
  }, { transaction: t })
}

const addRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await dbCreate(sequelize.models.registered_person, registeredPerson, { transaction: t })
}

const addDog = async (dog) => {
  let newDog
  await sequelize.transaction(async (t) => {
    newDog = await dbCreate(sequelize.models.dog, dog, { transaction: t })

    if (dog.owner) {
      await addRegisteredPerson(dog.owner, 1, newDog.id, t)
      await addToSearchIndex(dog.owner, dog, t)
    }

    if (dog.keeper) {
      await addRegisteredPerson(dog.keeper, 2, newDog.id, t)
      await addToSearchIndex(dog.keeper, dog, t)
    }
  })
  return newDog.id
}

const buildAddress = (addr) => {
  const addrParts = []
  if (addr?.addressLine1) {
    addrParts.push(addr.addressLine1)
  }
  if (addr?.addressLine2) {
    addrParts.push(addr.addressLine2)
  }
  if (addr?.town) {
    addrParts.push(addr.town)
  }
  if (addr?.postcode) {
    addrParts.push(addr.postcode)
  }
  return addrParts.join(', ')
}

module.exports = addDog
