const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const getBreed = require('../lookups/dog-breed')
const getMicrochipType = require('../lookups/microchip-type')
const importSchema = require('./imported-dog-schema')

const process = async (maxRecords) => {
  maxRecords = maxRecords || 99999
  let rowsProcessed = 0
  let rowsInError = 0
  let rowsIntoDb = 0

  const notSuppliedMicrochipType = (await getMicrochipType('N/A')).id

  await sequelize.transaction(async (t) => {
    const backlogRows = await sequelize.models.backlog.findAll({
      limit: maxRecords,
      where: {
        status: 'IMPORTED'
      }
    })

    if (backlogRows.length === 0) {
      return { rowsProcessed, rowsInError, rowsIntoDb }
    }

    // Create dog records in DB
    for (let i = 0; i < backlogRows.length; i++) {
      rowsProcessed++
      try {
        const jsonObj = backlogRows[i].dataValues.json

        const dog = await buildDog(jsonObj, notSuppliedMicrochipType)
        const validationErrors = importSchema.isValidImportedDog(dog)
        if (validationErrors.error !== undefined) {
          // console.log(`validation [${i}]`, validationErrors)
          rowsInError++
          await backlogRows[i].update({ status: 'PROCESSING_ERROR', errors: validationErrors.error.details })
        } else {
          await sequelize.models.dog.create(dog)
          await backlogRows[i].update({ status: 'PROCESSED', errors: [] })
          rowsIntoDb++
        }
      } catch (e) {
        console.log(e)
        rowsInError++
        await backlogRows[i].update({ status: 'PROCESSING_ERROR', errors: [{ error: `${e.message} ${e.stack}` }] })
      }
    }
  })

  return { rowsProcessed, rowsInError, rowsIntoDb }
}

const buildDog = async (jsonObj, notSuppliedMicrochipType) => ({
  dog_reference: uuidv4(),
  orig_index_number: jsonObj.dogIndexNumber,
  name: jsonObj.dogName,
  dog_breed_id: await getBreedIfValid(jsonObj),
  status_id: 1,
  birth_date: jsonObj.dogDateOfBirth,
  tattoo: jsonObj.tattoo,
  microchip_number: jsonObj.microchipNumber,
  microchip_type_id: (await getMicrochipTypeIfValid(jsonObj)) ?? notSuppliedMicrochipType,
  colour: jsonObj.colour,
  sex: jsonObj.sex,
  exported: jsonObj?.dogExported === 'Yes'
})

const getBreedIfValid = async (jsonObj) => {
  const breed = await getBreed(jsonObj.breed)
  if (breed) {
    return breed.id
  }
  throw new Error(`Invalid breed: ${jsonObj.breed}`)
}

const getMicrochipTypeIfValid = async (jsonObj) => {
  if (!jsonObj.microchipType) {
    return null
  }
  const microchipType = await getMicrochipType(jsonObj.microchipType)
  if (microchipType) {
    return microchipType.id
  }
  throw new Error(`Invalid microchip type: ${jsonObj.microchipType}`)
}

module.exports = {
  process
}
