const sequelize = require('../../config/db')
const { /* processRegisterRows, */ populatePoliceForce } = require('./processor')

const processRegister = async (register) => {
  await sequelize.transaction(async (t) => {
    // await processRegisterRows(register)
    await populatePoliceForce(register)
  })
}

module.exports = {
  processRegister
}
