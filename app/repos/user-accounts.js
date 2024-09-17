const sequelize = require('../config/db')

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const isAccountEnabled = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account?.activated_date
}

module.exports = {
  isAccountEnabled
}
