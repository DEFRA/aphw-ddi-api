const { sendCreateToAudit, sendDeleteToAudit } = require('../../messaging/send-audit')
const { USER_ACCOUNT } = require('../../constants/event/audit-event-object-types')

const createUserAccountAudit = async (account, user) => {
  await sendCreateToAudit(USER_ACCOUNT, account, user)
}

const deleteUserAccountAudit = async (account, user) => {
  await sendDeleteToAudit(USER_ACCOUNT, account, user)
}

module.exports = {
  createUserAccountAudit,
  deleteUserAccountAudit
}
