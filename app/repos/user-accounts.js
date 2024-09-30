const sequelize = require('../config/db')
const { addMinutes } = require('../lib/date-helpers')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { getPoliceForce } = require('../lookups')
const { NotFoundError } = require('../errors/not-found')
const { createUserAccountAudit, deleteUserAccountAudit } = require('../dto/auditing/user')

/**
 * @typedef UserAccount
 * @property {number} id
 * @property {string} username
 * @property {number|null} police_force_id - 1,
 * @property {string|null} activation_token
 * @property {Date|null} activation_token_expiry
 * @property {Date|null} activated_date
 * @property {Date|null} accepted_terms_and_conds_date
 * @property {boolean} active
 * @property {Date|null} last_login_date
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef UserAccountRequestDto
 * @property {string} username
 * @property {string} [telephone]
 * @property {boolean} [active]
 * @property {number} [police_force_id]
 * @property {string} police_force
 */

/**
 * @typedef UserAccountDto
 * @property {string} username
 * @property {string} [telephone]
 * @property {boolean} [active]
 * @property {number} [police_force_id]
 */

/**
 * @param {UserAccountRequestDto} account
 * @param user
 * @param [transaction]
 * @return {Promise<UserAccount>}
 */
const createAccount = async (account, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createAccount(account, user, t))
  }

  const foundUser = await sequelize.models.user_account.findOne({
    where: {
      username: account.username
    }
  }, transaction)

  if (foundUser) {
    throw new DuplicateResourceError('This user is already in the allow list')
  }

  const { police_force: policeForce, ...accountWithoutPoliceForce } = account

  let createdAccount

  if (!policeForce || account.police_force_id) {
    createdAccount = await sequelize.models.user_account.create(accountWithoutPoliceForce, transaction)
  } else {
    const policeForceObj = await getPoliceForce(policeForce)

    if (policeForceObj === null) {
      throw new NotFoundError(`${policeForce} not found`)
    }
    createdAccount = await sequelize.models.user_account.create({
      ...accountWithoutPoliceForce,
      police_force_id: policeForceObj.id
    }, transaction)
  }

  await createUserAccountAudit(createdAccount, user)

  return createdAccount
}

const deleteAccount = async (accountId, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => deleteAccount(accountId, user, t))
  }

  const account = await sequelize.models.user_account.findOne({
    where: {
      id: accountId
    },
    transaction
  })
  await sequelize.models.user_account.destroy({ where: { id: accountId }, transaction })
  await deleteUserAccountAudit(account, user)
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
  deleteAccount,
  isAccountEnabled,
  getAccount,
  setActivationCodeAndExpiry,
  setActivatedDate,
  setLoginDate,
  verifyLicenceAccepted,
  setLicenceAcceptedDate
}
