const sequelize = require('../config/db')

const isAccountEnabled = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  console.log('account', account?.activated_date)
  return account?.activated_date
}

module.exports = {
  isAccountEnabled
}
