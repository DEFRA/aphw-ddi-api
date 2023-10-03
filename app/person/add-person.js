const sequelize = require('../config/db')

const addPeople = async (people) => {
  sequelize.transaction(async (t) => {
    for (const person of people) {
      const createdPerson = await sequelize.models.person.create(person, { transaction: t })
      const createdAddress = await sequelize.models.address.create(person.address, { transaction: t })

      const personAddress = {
        person_id: createdPerson.id,
        address_id: createdAddress.id
      }

      await sequelize.models.person_address.create(personAddress, { transaction: t })
    }
  })
}

module.exports = addPeople
