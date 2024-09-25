const sequelize = require('../config/db')
const { addMinutes } = require('../lib/date-helpers')
const { DuplicateResourceError } = require('../errors/duplicate-record')

/**
 * @typedef UserAccount
 * @property {string} username
 * @property {string} telephone
 * @property {string} activation_token
 * @property {Date} activation_token_expiry
 * @property {Date} activated_date
 * @property {Date} accepted_terms_and_conds_date
 * @property {boolean} active
 * @property {Date} last_login_date
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef UserAccountDto
 * @property {string} username
 * @property {string} [telephone]
 * @property {boolean} [active]
 */

/**
 * @param {UserAccountDto} account
 * @param transaction
 * @return {Promise<UserAccountDto>}
 */
const createAccount = async (account, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createAccount(account, t))
  }

  const foundUser = await sequelize.models.user_account.findOne({ username: account.username }, transaction)

  if (foundUser) {
    throw new DuplicateResourceError('This user is already in the allow list')
  }

  return sequelize.models.user_account.create(account, transaction)
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
const isAccountEnabled = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account?.activated_date && !!account.active
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

module.exports = {
  createAccount,
  isAccountEnabled,
  getAccount,
  setActivationCodeAndExpiry,
  setActivatedDate,
  setLoginDate,
  verifyLicenceAccepted,
  setLicenceAcceptedDate
}
