const sequelize = require('../../config/db')
const { processRegisterRows, populatePoliceForce } = require('./processor')

const processRegister = async (register, rollback = true) => {
  console.log('Process register rollback', rollback)

  try {
    await sequelize.transaction(async (t) => {
      await processRegisterRows(register, t)
      await populatePoliceForce(register, rollback, t)

      if (rollback) {
        throw new Error('Rolling back')
      }
    })
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
