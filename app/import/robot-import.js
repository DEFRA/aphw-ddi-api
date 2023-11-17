// const { doDogsExistById } = require('../dog/dogs-exist')
const { isValidRobotSchema } = require('./robot-schema')

const processRobotImport = async (dogsAndPeople) => {
  const errors = []

  /// Validate schema
  const validationErrors = isValidRobotSchema(dogsAndPeople)
  if (validationErrors.error !== undefined) {
    validationErrors.error.details.map(x => errors.push(x.message))
    return { errors }
  }

  // sequelize.transaction(async (t) => {
  // Determine which dogs already exist
  console.log('data.dogs', dogsAndPeople.data[0].dogs)
  const dogIds = dogsAndPeople.data[0].dogs.map(x => x.indexNumber)
  // const existingDogIds = await doDogsExistById(dogIds)

  console.log('dogIds', dogIds)
  // console.log('errors', errors)
  /*
    for (const dog of dogsAndPeople.dogs) {
      const existingDog = dog.indexNumber ? await getDogById(dog.indexNumber) : null
      if (existingDog) {
        errors.push(`Dog index number ${dog.indexNumber} already exists`)
        continue
      }
      const createdDog = await sequelize.models.dog.create(dog, { transaction: t })

      }

      }
      for (const person of dogsAndPeople.people) {
        await addRegisteredPerson(person, (await getPersonType(person.type)).id, createdDog.id, t)
      }
    }
    */
  // })
}

module.exports = {
  processRobotImport
}
