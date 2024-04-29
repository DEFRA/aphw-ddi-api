const { sendImportToAudit } = require('../../messaging/send-audit')

const generateAuditEvents = async (register, user) => {
  for (const row of register.add) {
    await sendImportToAudit(row, user)
  }
}

module.exports = {
  generateAuditEvents
}
