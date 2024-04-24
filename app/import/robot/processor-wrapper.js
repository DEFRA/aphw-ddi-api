const sequelize = require('../../config/db')
const { processRegisterRows, populatePoliceForce } = require('./processor')

const processRegister = async (register, rollback) => {
  try {
    console.log('here1')
    await processRegisterInTransaction(register, rollback)
    console.log('here2')
  } catch (err) {
    console.log('here3', err.message)
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
