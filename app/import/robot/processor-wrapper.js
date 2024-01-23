const sequelize = require('../../config/db')
const { processRegisterRows } = require('./processor')

const processRegister = async (register) => {
  await sequelize.transaction(async (t) => {
    await processRegisterRows(register)
  })
}

module.exports = {
  processRegister
}
