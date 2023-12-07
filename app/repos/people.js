const sequelize = require('../config/db')
const createRegistrationNumber = require('../lib/create-registration-number')

const createPeople = async (owners, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createPeople(owners, t))
  }

  const createdPeople = []

  try {
    for (const owner of owners) {
      const person = await sequelize.models.person.create({
        first_name: owner.firstName,
        last_name: owner.lastName,
        birth_date: owner.dateOfBirth,
        person_reference: createRegistrationNumber()
      }, { transaction })

      const address = await sequelize.models.address.create({
        address_line_1: owner.address.addressLine1,
        address_line_2: owner.address.addressLine2,
        town: owner.address.town,
        postcode: owner.address.postcode,
        country_id: 1
      }, { transaction })

      await sequelize.models.person_address.create({
        person_id: person.id,
        address_id: address.id
      }, { transaction })

      createdPeople.push(person)
    }

    return createdPeople
  } catch (err) {
    console.error(`Error creating owner: ${err}`)
    throw err
  }
}

module.exports = {
  createPeople
}
