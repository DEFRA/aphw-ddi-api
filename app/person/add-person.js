const sequelize = require('../config/db')
const { getCountry, getContactType } = require('../lookups')
const createReferenceNumber = require('../lib/create-registration-number')
const { dbCreate } = require('../../app/lib/db-functions')

const addToSearchIndex = async (person, t) => {
  await dbCreate(sequelize.models.search_index, {
    search: sequelize.fn('to_tsvector', `${person.person_reference} ${person.first_name} ${person.last_name}`),
    reference_number: person.person_reference,
    json: {
      firstName: person.first_name,
      lastName: person.last_name,
      postcode: person.address.postcode
    }
  }, { transaction: t })
}

const addPeople = async (people, t) => {
  const references = []
  if (t) {
    for (const person of people) {
      references.push(await addPerson(person, t))
    }
  } else {
    await sequelize.transaction(async (t) => {
      for (const person of people) {
        references.push(await addPerson(person, t))
      }
    })
  }
  return references
}

const addPerson = async (person, t) => {
  if (t) {
    return await addPersonInsideExistingTransaction(person, t)
  } else {
    return await sequelize.transaction(async (t) => {
      return await addPersonInsideExistingTransaction(person, t)
    })
  }
}

const addPersonInsideExistingTransaction = async (person, t) => {
  person.address.country_id = (await getCountry(person.address.country)).id

  person.person_reference = createReferenceNumber()

  const createdPerson = await dbCreate(sequelize.models.person, person, { transaction: t })
  const createdAddress = await dbCreate(sequelize.models.address, person.address, { transaction: t })

  for (const contact of person.contacts) {
    contact.contact_type_id = (await getContactType(contact.type)).id

    const createdContact = await dbCreate(sequelize.models.contact, contact, { transaction: t })

    const personContact = {
      person_id: createdPerson.id,
      contact_id: createdContact.id
    }

    await dbCreate(sequelize.models.person_contact, personContact, { transaction: t })
  }

  const personAddress = {
    person_id: createdPerson.id,
    address_id: createdAddress.id
  }

  await dbCreate(sequelize.models.person_address, personAddress, { transaction: t })

  await addToSearchIndex(person, t)

  return { person_reference: createdPerson.person_reference, id: createdPerson.id }
}

module.exports = {
  addPeople,
  addPerson
}
