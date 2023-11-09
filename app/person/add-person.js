const sequelize = require('../config/db')
const { getTitle, getCounty, getCountry, getContactType } = require('../lookups')
const createReferenceNumber = require('../lib/create-registration-number')

const addToSearchIndex = async (person) => {
  await sequelize.models.search_index.create({
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
      person.title_id = (await getTitle(person.title)).id
      person.address.county_id = (await getCounty(person.address.county)).id
      person.address.country_id = (await getCountry(person.address.country)).id

      person.person_reference = createReferenceNumber()

      const createdPerson = await sequelize.models.person.create(person, { transaction: t })
      const createdAddress = await sequelize.models.address.create(person.address, { transaction: t })

      for (const contact of person.contacts) {
        contact.contact_type_id = (await getContactType(contact.type)).id

        const createdContact = await sequelize.models.contact.create(contact, { transaction: t })

        const personContact = {
          person_id: createdPerson.id,
          contact_id: createdContact.id
        }

        await sequelize.models.person_contact.create(personContact, { transaction: t })
      }

      references.push(person.person_reference)

      const personAddress = {
        person_id: createdPerson.id,
        address_id: createdAddress.id
      }

      await sequelize.models.person_address.create(personAddress, { transaction: t })

      await addToSearchIndex(person)
    }
  })

  return references
}

module.exports = addPeople
