const sequelize = require('../config/db')
const { getTitle, getCounty, getCountry, getContactType } = require('../lookups')
const createReferenceNumber = require('../lib/create-registration-number')
const { dbCreate } = require('../../app/lib/db-functions')

const addToSearchIndex = async (person) => {
  await dbCreate(sequelize.models.search_index, {
    search: sequelize.fn('to_tsvector', `${person.person_reference} ${person.first_name} ${person.last_name}`),
    reference_number: person.person_reference,
    json: {
      firstName: person.first_name,
      lastName: person.last_name,
      postcode: person.address.postcode
    }
  })
}

const addPeople = async (people) => {
  const references = []

  await sequelize.transaction(async (t) => {
    for (const person of people) {
      references.push(await addPerson(person, t))
    }
  })

  return references
}

const addPerson = async (person, t) => {
  let res
  if (t) {
    res = await addPersonInsideExistingTransaction(person, t)
  } else {
    await sequelize.transaction(async (t) => {
      res = await addPersonInsideExistingTransaction(person, t)
    })
  }
  return res
}

const addPersonInsideExistingTransaction = async (person, t) => {
  person.title_id = person?.title ? (await getTitle(person.title)).id : null
  person.address.county_id = person.address?.county ? (await getCounty(person.address.county)).id : null
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

  await addToSearchIndex(person)

  return { person_reference: createdPerson.person_reference, id: createdPerson.id }
}

module.exports = {
  addPeople,
  addPerson
}
