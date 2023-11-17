const sequelize = require('../config/db')
const { getAllDogIds } = require('../dog/get-dog')
const { isValidRobotSchema } = require('./robot-schema')
const { addPerson } = require('../../app/person/add-person')
const { getPersonType } = require('../../app/lookups')

const processRobotImport = async (dogsAndPeople) => {
  const errors = []
  const created = []

  /// Validate schema
  const validationErrors = isValidRobotSchema(dogsAndPeople)
  if (validationErrors.error !== undefined) {
    validationErrors.error.details.map(x => errors.push(x.message))
    return { errors }
  }

  // Construct set of which dogs already exist
  const existingDogIds = new Set(await getAllDogIds())

  sequelize.transaction(async (t) => {
    for (const row of dogsAndPeople.data) {
      for (const dog of row.dogs) {
        !existingDogIds.has(dog.indexNumber)
          ? await sequelize.models.dog.create(dog, { transaction: t })
          : errors.push(`Dog index number ${dog.indexNumber} already exists`)
        for (const person of row.people) {
          await addPerson(person, t)
          await sequelize.models.registered_person.create({
            person_id: person.id,
            dog_id: dog.id,
            person_type_id: (await getPersonType(person.type)).id
          }, {
            transaction: t
          })
        }
      }
    }
  })
}

module.exports = {
  processRobotImport
}
