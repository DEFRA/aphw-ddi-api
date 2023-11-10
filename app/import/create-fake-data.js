const sequelize = require('../config/db')
const { faker } = require('@faker-js/faker')

const createFakePeople = async (maxRecords) => {
  let rowsProcessed = 0
  maxRecords = maxRecords || 99999
  await sequelize.transaction(async (t) => {
    const backlogRows = await sequelize.models.backlog.findAll({
      limit: maxRecords,
      where: {
        status: 'IMPORTED'
      }
    })

    if (backlogRows.length > 0) {
      for (let i = 0; i < backlogRows.length; i++) {
        rowsProcessed++
        const jsonObj = backlogRows[i].dataValues.json
        const newJson = buildPerson(jsonObj)
        backlogRows[i].json = newJson
        backlogRows[i].changed('json', true)
        await backlogRows[i].save()
      }
    }
  })
  return rowsProcessed
}

const buildPerson = (jsonObj) => {
  jsonObj.firstName = faker.person.firstName()
  jsonObj.lastName = faker.person.lastName()
  jsonObj.addressLine1 = faker.location.streetAddress()
  jsonObj.postcodePart1 = `${faker.string.alpha({ length: 2 })}${faker.number.int({ min: 1, max: 32 })}`
  jsonObj.postcodePart2 = `${faker.number.int({ min: 1, max: 9 })}${faker.string.alpha({ length: 2 })}`
  jsonObj.microchipNumber = jsonObj?.microchipType !== 'N/A' ? faker.string.numeric({ length: 15 }) : null
  return jsonObj
}

module.exports = {
  createFakePeople
}
