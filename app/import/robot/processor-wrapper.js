const sequelize = require('../../config/db')
const { processRegisterRows, populatePoliceForce } = require('./processor')

const processRegister = async (register, rollback) => {
  try {
    await processRegisterInTransaction(register, rollback)
  } catch (err) {
    if (err.message !== 'Rolling back') {
      console.log('import error', err)
      register.errors.push(err.message)
    }
  }
}

const processRegisterInTransaction = async (register, rollback, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => processRegisterInTransaction(register, rollback, t))
  }

  await processRegisterRows(register, transaction)
  await populatePoliceForce(register, rollback, transaction)

  if (rollback) {
    throw new Error('Rolling back')
  }
}

module.exports = {
  processRegister,
  processRegisterInTransaction
}
