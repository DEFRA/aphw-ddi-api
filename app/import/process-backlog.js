const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const getBreed = require('../lookups/dog-breed')
// const getMicrochipType = require('../lookups/microchip-type')
const importSchema = require('./imported-dog-schema')

const process = async (maxRecords) => {
  maxRecords = maxRecords || 99999
  let rowsProcessed = 0
  let rowsInError = 0
  let rowsIntoDb = 0

  const xlBullyBreedId = (await getBreed('XL Bully')).dataValues.id

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

        const dog = buildDog(jsonObj, xlBullyBreedId)
        const validationErrors = importSchema.isValidImportedDog(dog)
        if (validationErrors.error !== undefined) {
          // console.log(`validation [${i}]`, validationErrors)
          rowsInError++
          await backlogRows[i].update({ status: 'PROCESSING_ERROR', errors: validationErrors.error.details })
        } else {
          rowsIntoDb++
          await sequelize.models.dog.create(dog)
          await backlogRows[i].update({ status: 'PROCESSED', errors: [] })
        }
      } catch (e) {
        console.log(e)
        rowsInError++
        await backlogRows[i].update({ status: 'PROCESSING_ERROR', errors: [e] })
      }
    }
  })

  return { rowsProcessed, rowsInError, rowsIntoDb }
}

const buildDog = (jsonObj, breedId) => {
  return {
    id: uuidv4(),
    orig_id: jsonObj.dogIndexNumber,
    name: jsonObj.dogName,
    dog_breed_id: breedId,
    status_id: 1,
    birth_date: jsonObj.dogDateOfBirth,
    tattoo: jsonObj.tattoo,
    microchip_number: jsonObj.microchipNumber,
    microchip_type_id: 1, // TODO (await getMicrochipType(jsonObj.microchipType)).dataValues.id,
    colour: jsonObj.colour,
    sex: jsonObj.sex,
    exported: jsonObj?.dogExported === 'Yes'
  }
}

module.exports = {
  process
}
