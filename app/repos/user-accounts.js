const sequelize = require('../config/db')
const { addMinutes } = require('../lib/date-helpers')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { getPoliceForce } = require('../lookups')
const { NotFoundError } = require('../errors/not-found')
const { createUserAccountAudit, deleteUserAccountAudit } = require('../dto/auditing/user')
const { getPoliceForceByShortName } = require('./police-forces')

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

const getPoliceForceIdForAccount = async ({
  police_force_id: policeForceId,
  police_force: policeForce,
  username
}, transaction) => {
  if (policeForceId) {
    return policeForceId
  }

  if (policeForce) {
    const policeForceObj = await getPoliceForce(policeForce)

    if (policeForceObj === null) {
      throw new NotFoundError(`${policeForce} not found`)
    }

    return policeForceObj.id
  }

  if (username) {
    const [, domain] = username.split('@')
    const shortName = domain.replace('.pnn.police.uk', '').replace('.police.uk', '')

    const policeForceObj = await getPoliceForceByShortName(shortName, transaction)

    if (policeForceObj !== null) {
      return policeForceObj.id
    }
  }

  return undefined
}

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

  const {
    police_force: _policeForce,
    police_force_id: _policeForceId,
    ...accountWithoutPoliceForce
  } = account

  const policeForceId = await getPoliceForceIdForAccount(account, transaction)

  const createdAccount = await sequelize.models.user_account.create({
    ...accountWithoutPoliceForce,
    police_force_id: policeForceId
  }, transaction)

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

  if (account === null) {
    throw new NotFoundError(`Account does not exist with id ${accountId}`)
  }

  await sequelize.models.user_account.destroy({ where: { id: accountId }, force: true, transaction })

  try {
    await deleteUserAccountAudit(account, user)
  } catch (e) {
    console.log('Error while publishing delete audit record', e)
    throw e
  }
}

/**
 * @param {UserAccountRequestDto[]} accountsDto
 * @param user
 * @return {Promise<{items: *[], errors: (*[]|undefined)}>}
 */
const createAccounts = async (accountsDto, user) => {
  const errors = []
  const accounts = []

  for (const accountDto of accountsDto) {
    try {
      const account = await createAccount(accountDto, user)
      accounts.push(account)
    } catch (e) {
      if (e instanceof DuplicateResourceError) {
        errors.push({
          data: {
            username: accountDto.username
          },
          statusCode: 409,
          error: 'Conflict',
          message: e.message
        })
      } else {
        errors.push({
          data: { username: accountDto.username },
          statusCode: 500,
          error: 'Internal Server Error',
          message: e.message
        })
      }
    }
  }

  return {
    items: accounts,
    errors: errors.length ? errors : undefined
  }
}

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
  createAccount,
  deleteAccount,
  createAccounts,
  isAccountEnabled,
  getAccount,
  setActivationCodeAndExpiry,
  setActivatedDate,
  setLoginDate,
  verifyLicenceAccepted,
  setLicenceAcceptedDate,
  isEmailVerified
}
