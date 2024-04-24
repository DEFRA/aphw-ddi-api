const sequelize = require('../../config/db')
const { processRegisterRows, populatePoliceForce } = require('./processor')

const processRegister = async (register, rollback, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => processRegister(register, rollback, t))
  }

  try {
    await processRegisterRows(register, transaction)
    await populatePoliceForce(register, rollback, transaction)

    if (rollback) {
      throw new Error('Rolling back')
    }
  } catch (err) {
    if (err.message !== 'Rolling back') {
      console.log('import error', err)
      register.errors.push(err.message)
    }
  }
}

module.exports = {
  processRegister
}
