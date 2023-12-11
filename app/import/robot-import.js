const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const { getAllDogIds } = require('../dog/get-dog')
const { isValidRobotSchema } = require('./robot-schema')
const { addPerson } = require('../../app/person/add-person')
const { getPersonType, getBreed } = require('../../app/lookups')
const { dbCreate } = require('../../app/lib/db-functions')
const { addToSearchIndex } = require('../repos/search')

let xlBullyBreedId
let existingDogIds
let stats
const newStatusId = 1

const processRobotImport = async (dogsAndPeople) => {
  stats = {
    errors: [],
    created: []
  }

  try {
    /// Validate schema
    const validationErrors = isValidRobotSchema(dogsAndPeople)
    if (validationErrors.error !== undefined) {
      validationErrors.error.details.map(x => stats.errors.push(x.message))
      return { stats }
    }

    xlBullyBreedId = (await getBreed('XL Bully')).id

    // Construct set of which dog ids already exist
    existingDogIds = new Set((await getAllDogIds()).map((x) => `${x.id}`))

    await sequelize.transaction(async (t) => {
      const createdDogIds = []
      for (const row of dogsAndPeople.data) {
        for (const dog of row.dogs) {
          if (stats.errors.length === 0) {
            createdDogIds.push(await processDog(dog, t))
          }
        }

        for (const person of row.people) {
          if (stats.errors.length === 0) {
            await processPerson(person, createdDogIds, t)
          }
        }

        for (const person of row.people) {
          for (const dog of row.dogs) {
            await addToSearchIndex(person, dog, t)
          }
        }

        if (stats.errors.length > 0) {
          throw new Error('Processing aborted')
        }
      }
    })
  } catch (e) {
    console.log(e)
    stats.errors.push(`Error: ${e.message}`)
  }
  return { stats }
}

const mapDogFields = (dog) => ({
  index_number: dog.indexNumber,
  name: dog.name,
  birth_date: dog.dateOfBirth,
  colour: dog.colour,
  sex: dog.sex,
  microchip_number: dog.microchipNumber,
  dog_breed_id: xlBullyBreedId,
  status_id: newStatusId,
  exported: false,
  dog_reference: uuidv4()
})

const mapPersonFields = (person) => ({
  first_name: person.firstName,
  last_name: person.lastName,
  address: {
    address_line_1: person.address.addressLine1,
    address_line_2: person.address.addressLine2,
    town: person.address.townOrCity,
    county: person.address.county,
    postcode: person.address.postcode,
    country: person.address.country
  },
  contacts: person.contacts
})

const processDog = async (dog, t) => {
  if (existingDogIds.has(dog.indexNumber)) {
    stats.errors.push(`Dog index number ${dog.indexNumber} already exists`)
    return dog.indexNumber
  }
  const newDog = mapDogFields(dog)
  const insertedDog = await dbCreate(sequelize.models.dog, newDog, { transaction: t })
  stats.created.push(`New dog index number ${newDog.index_number} created`)
  return insertedDog.id
}

const processPerson = async (person, dogIds, t) => {
  const newPerson = mapPersonFields(person)
  const insertedPerson = await addPerson(newPerson, t)
  stats.created.push(`Created person id ${insertedPerson.id}`)
  for (const dogId of dogIds) {
    const registeredPerson = {
      person_id: insertedPerson.id,
      dog_id: dogId,
      person_type_id: (await getPersonType(person.type)).id
    }
    await dbCreate(sequelize.models.registered_person, registeredPerson, { transaction: t })
    stats.created.push(`Linked person id ${insertedPerson.id} to dog id ${dogId}`)
  }
}

module.exports = {
  processRobotImport
}
