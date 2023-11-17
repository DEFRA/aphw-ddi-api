const { getAllDogIds } = require('../dog/get-dog')
const { isValidRobotSchema } = require('./robot-schema')

const processRobotImport = async (dogsAndPeople) => {
  const errors = []
  const warnings = []

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
      for (const dog of dogsAndPeople.dogs) {
        if (!existingDogIds.has(dog.indexNumber)) {
          await sequelize.models.dog.create(dog, { transaction: t })
        } else {
          warnings.push(`Dog index number ${dog.indexNumber} already exists`)
        }

        }
        for (const person of dogsAndPeople.people) {
          await addRegisteredPerson(person, (await getPersonType(person.type)).id, createdDog.id, t)
        }
      }
    }
  })
}

module.exports = {
  processRobotImport
}
