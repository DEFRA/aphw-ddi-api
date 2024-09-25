const sequelize = require('../config/db')
const { addMinutes } = require('../lib/date-helpers')

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const isAccountEnabled = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account?.active
}

/**
 * @param {string} username
 * @return {Promise<UserAccount>}
 */
const getAccount = async (username) => {
  return await sequelize.models.user_account.findOne({
    where: { username }
  })
}

/**
 * @param {string} username
 * @param {string} oneTimeCode
 * @param {int} expiryInMins
 * @return {Promise<boolean>}
 */
const setActivationCodeAndExpiry = async (username, oneTimeCode, expiryInMins) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  if (account) {
    account.activation_token = oneTimeCode
    account.activation_token_expiry = addMinutes(new Date(), expiryInMins)
    await account.save()
    return true
  }

  return false
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const setLoginDate = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  if (account) {
    account.last_login_date = new Date()
    await account.save()
    return true
  }

  return false
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const setActivatedDate = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  if (account) {
    account.activated_date = new Date()
    await account.save()
    return true
  }

  return false
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const setLicenceAcceptedDate = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  if (account) {
    account.accepted_terms_and_conds_date = new Date()
    await account.save()
    return true
  }

  return false
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const verifyLicenceAccepted = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account?.accepted_terms_and_conds_date
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const isEmailVerified = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account.activated_date
}

module.exports = {
  isAccountEnabled,
  getAccount,
  setActivationCodeAndExpiry,
  setActivatedDate,
  setLoginDate,
  verifyLicenceAccepted,
  setLicenceAcceptedDate,
  isEmailVerified
}
