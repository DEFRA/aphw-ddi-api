const { createCdo } = require('../../repos/cdo')
const sequelize = require('../../config/db')

const processRegister = async (register) => {
  await sequelize.transaction(async (t) => {
    for (const record of register.add) {
      record.owner.phoneNumber = `0${owner.phoneNumber}`

      record.dog.breed = 'XL Bully'

      await createCdo(record, t)
    }
  })
}

module.exports = {
  processRegister
}
