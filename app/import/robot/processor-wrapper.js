const sequelize = require('../../config/db')
const { processRegisterRows, populatePoliceForce } = require('./processor')
const { generateAuditEvents } = require('./audit')

const processRegister = async (register, rollback, user, transaction) => {
  try {
    await processRegisterInTransaction(register, rollback, user, transaction)
  } catch (err) {
    if (err.message !== 'Rolling back') {
      console.log('import error', err)
      register.errors.push(err.message)
    }
  }
}

const processRegisterInTransaction = async (register, rollback, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => {
      return processRegisterInTransaction(register, rollback, user, t)
    })
  }

  await processRegisterRows(register, transaction)
  await populatePoliceForce(register, rollback, transaction)

  if (rollback) {
    throw new Error('Rolling back')
  }

  await generateAuditEvents(register, user)
}

module.exports = {
  processRegister,
  processRegisterInTransaction
}
