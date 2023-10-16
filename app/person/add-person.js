const sequelize = require('../config/db')
const { getTitle, getCounty, getCountry } = require('../lookups')
const createReferenceNumber = require('../lib/create-registration-number')

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

      references.push(person.person_reference)

      const personAddress = {
        person_id: createdPerson.id,
        address_id: createdAddress.id
      }

      await sequelize.models.person_address.create(personAddress, { transaction: t })
    }
  })

  return references
}

module.exports = addPeople
