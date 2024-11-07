const config = require('../config/index')
const sequelize = require('../config/db')
const { addMinutes } = require('../lib/date-helpers')
const { extractShortNameAndDomain } = require('../lib/string-helpers')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { getPoliceForce } = require('../lookups')
const { NotFoundError } = require('../errors/not-found')
const { createUserAccountAudit, deleteUserAccountAudit } = require('../dto/auditing/user')
const { getPoliceForceByShortName } = require('./police-forces')
const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')

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
 * @property {null|PoliceForceDao} police_force
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
 * @property {number} [policeForceId]
 */

/**
 * @param filter
 * @return {{ where?: { police_force_id?: number; '$police_force.name$': string }}}
 */
const makeUserAccountDbFilter = filter => Object.entries(filter).reduce((whereBlock, [key, value]) => {
  if (key === 'policeForceId') {
    return {
      where: {
        ...whereBlock.where,
        police_force_id: value
      }
    }
  }

  if (key === 'policeForce') {
    return {
      where: {
        ...whereBlock.where,
        '$police_force.name$': value
      }
    }
  }

  if (key === 'username') {
    return {
      where: {
        ...whereBlock.where,
        username: value
      }
    }
  }

  return {}
}, {})

/**
 * @typedef GetAccountsFilterOptions
 * @property {number} [policeForceId]
 * @property {string} [policeForce]
 */
/**
 * @typedef GetAccounts
 * @param {GetAccountsFilterOptions} filter
 * @param sort
 * @return {Promise<UserAccount[]>}
 */

/**
 * @param {GetAccountsFilterOptions} filter
 * @param sort
 * @return {Promise<UserAccount[]>}
 */
const getAccounts = async (filter = {}, sort = {}) => {
  const where = makeUserAccountDbFilter(filter)

  const order = {}

  const options = {
    include: {
      model: sequelize.models.police_force,
      as: 'police_force'
    },
    ...where,
    ...order
  }

  return sequelize.models.user_account.findAll(options)
}

/**
 * @typedef GetPoliceForceIdForAccount
 * @param {number} policeForceId
 * @param policeForce
 * @param username
 * @param transaction
 * @return {Promise<undefined|number>}
 */

/**
 * @type {GetPoliceForceIdForAccount}
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
    const { shortName } = extractShortNameAndDomain(username)
    const policeForceObj = await getPoliceForceByShortName(shortName, transaction)

    if (policeForceObj !== null) {
      return policeForceObj.id
    }
  }

  return undefined
}

/**
 * @typedef CreateAccount
 * @param {UserAccountRequestDto} account
 * @param user
 * @param [transaction]
 * @return {Promise<UserAccount>}
 */
/**
 * @type {CreateAccount}
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

  const accountWithoutPoliceForce = { ...account }
  delete accountWithoutPoliceForce.police_force
  delete accountWithoutPoliceForce.police_force_id

  const policeForceId = await getPoliceForceIdForAccount(account, transaction)

  const createdAccount = await sequelize.models.user_account.create({
    ...accountWithoutPoliceForce,
    police_force_id: policeForceId
  }, transaction)

  const emailData = {
    toAddress: account.username,
    type: emailTypes.userInvite,
    customFields: [{ name: 'ddi_url', value: config.enforcementUrl }]
  }

  await sendEmail(emailData)

  await createUserAccountAudit(createdAccount, user)

  return createdAccount
}

/**
 * @typedef DeleteAccount
 * @param accountId
 * @param user
 * @param transaction
 * @return {Promise<undefined>}
 */
/**
 * @type {DeleteAccount}
 */
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
 * @typedef CreateAccounts
 * @param {UserAccountRequestDto[]} accountsDto
 * @param user
 * @return {Promise<{items: *[], errors: (*[]|undefined)}>}
 */

/**
 * @type {CreateAccounts}
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
 * @typedef IsAccountEnabled
 * @param {string} username
 * @return {Promise<boolean>}
 */

/**
 * @type {IsAccountEnabled}
 */
const isAccountEnabled = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account?.active
}

/**
 * @typedef GetAccount
 * @param {string} username
 * @return {Promise<UserAccount>}
 */

/**
 * @type {GetAccount}
 */
const getAccount = async (username) => {
  return await sequelize.models.user_account.findOne({
    where: { username }
  })
}

/**
 * @typedef SetActivationCodeAndExpiry
 * @param {string} username
 * @param {string} oneTimeCode
 * @param {int} expiryInMins
 * @return {Promise<boolean>}
 */

/**
 * @type {SetActivationCodeAndExpiry}
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
 * @typedef SetLoginDate
 * @param {string} username
 * @return {Promise<boolean>}
 */

/**
 * @type SetLoginDate
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
 * @typedef SetActivatedDate
 * @param {string} username
 * @return {Promise<boolean>}
 */

/**
 * @type {SetActivatedDate}
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
 * @typedef SetLicenceAcceptedDate
 * @param {string} username
 * @return {Promise<boolean>}
 */

/**
 * @type {SetLicenceAcceptedDate}
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
 * @typedef VerifyLicenseValid
 * @param {string} username
 * @return {Promise<{
 *   accepted: boolean;
 *   valid: boolean;
 * }>}
 */
/** @type {VerifyLicenseValid} **/
const verifyLicenseValid = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  const yearAgo = new Date()
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1)
  yearAgo.setUTCHours(23)
  yearAgo.setUTCMinutes(59)
  yearAgo.setUTCMilliseconds(999)
  yearAgo.setUTCSeconds(59)

  const accepted = !!account?.accepted_terms_and_conds_date
  const valid = accepted && account.accepted_terms_and_conds_date > yearAgo

  return {
    accepted,
    valid
  }
}

/**
 * @typedef IsEmailVerified
 * @param {string} username
 * @return {Promise<boolean>}
 */
/**
 * @type {IsEmailVerified}
 */
const isEmailVerified = async (username) => {
  const account = await sequelize.models.user_account.findOne({
    where: { username }
  })

  return !!account.activated_date
}

/**
 * @typedef UserAccountRepository
 * @property {GetAccounts} getAccounts
 * @property {CreateAccount} createAccount
 * @property {DeleteAccount} deleteAccount
 * @property {CreateAccounts} createAccounts
 * @property {GetPoliceForceIdForAccount} getPoliceForceIdForAccount
 * @property {IsAccountEnabled} isAccountEnabled
 * @property {GetAccount} getAccount
 * @property {SetActivationCodeAndExpiry} setActivationCodeAndExpiry
 * @property {SetActivatedDate} setActivatedDate
 * @property {SetLoginDate} setLoginDate
 * @property {VerifyLicenseValid} verifyLicenseValid
 * @property {SetLicenceAcceptedDate} setLicenceAcceptedDate
 * @property {IsEmailVerified} isEmailVerified
 */

/**
 * @type {UserAccountRepository}
 */
module.exports = {
  getAccounts,
  createAccount,
  deleteAccount,
  createAccounts,
  getPoliceForceIdForAccount,
  isAccountEnabled,
  getAccount,
  setActivationCodeAndExpiry,
  setActivatedDate,
  setLoginDate,
  verifyLicenseValid,
  setLicenceAcceptedDate,
  isEmailVerified
}
