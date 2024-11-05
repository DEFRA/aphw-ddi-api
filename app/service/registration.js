const { randomInt } = require('crypto')
const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')
const { getCallingUsername } = require('../auth/get-user')
const { NotFoundError } = require('../errors/not-found')

const expiryInMinsForOtp = '60'

const actionResults = {
  ACCOUNT_NOT_FOUND: 'Account not found',
  ACCOUNT_NOT_ENABLED: 'Account not enabled',
  ACCOUNT_NOT_ACTIVATED: 'Account not activated',
  ACTIVATION_CODE_EXPIRED: 'Activation code has expired',
  INVALID_ACTIVATION_CODE: 'Invalid activation code',
  MUST_ACCEPT_TS_AND_CS: 'Must accept terms and conditions',
  OK: 'Ok',
  ERROR: 'Error'
}

class RegistrationService {
  /**
   * @param {UserAccountRepository} userAccountRepository
   */
  constructor (userAccountRepository) {
    this.userAccountRepository = userAccountRepository
  }

  /**
   * @param request
   * @return {string}
   */
  getUsername (request) {
    const username = getCallingUsername(request)
    if (username) {
      return username
    }
    throw new NotFoundError('user not found')
  }

  /**
   * @return {string}
   */
  generateOneTimeCode () {
    return `${(Math.floor(100000 + randomInt(900000)))}`
  }

  /**
   * @param request
   * @return {Promise<string>}
   */
  async verifyEmailCode (request) {
    const username = this.getUsername(request)
    const oneTimeCode = request.payload?.code

    const account = await this.userAccountRepository.getAccount(username)
    if (!account) {
      return actionResults.ACCOUNT_NOT_FOUND
    }

    if (!account.active) {
      return actionResults.ACCOUNT_NOT_ENABLED
    }

    if (account.activation_token === oneTimeCode) {
      if (account.activation_token_expiry <= new Date()) {
        return actionResults.ACTIVATION_CODE_EXPIRED
      }

      await this.userAccountRepository.setActivatedDate(username)

      return actionResults.OK
    }

    return actionResults.INVALID_ACTIVATION_CODE
  }

  /**
   * @param {string} username
   * @return {Promise<string>}
   */
  async verifyLogin (username) {
    const account = await this.userAccountRepository.getAccount(username)
    if (!account) {
      return actionResults.ACCOUNT_NOT_FOUND
    }

    if (!account.active) {
      return actionResults.ACCOUNT_NOT_ENABLED
    }

    if (!account.activated_date) {
      return actionResults.ACCOUNT_NOT_ACTIVATED
    }

    await this.userAccountRepository.setLoginDate(username)

    if (!account.accepted_terms_and_conds_date) {
      return actionResults.MUST_ACCEPT_TS_AND_CS
    }

    return actionResults.OK
  }

  /**
   * @param {string} username
   * @return {Promise<string|string>}
   */
  async acceptLicence (username) {
    const account = await this.userAccountRepository.getAccount(username)

    if (!account) {
      return actionResults.ACCOUNT_NOT_FOUND
    }

    if (!account.active) {
      return actionResults.ACCOUNT_NOT_ENABLED
    }

    return await this.userAccountRepository.setLicenceAcceptedDate(username) ? actionResults.OK : actionResults.ERROR
  }

  /**
   * @param request
   * @return {Promise<{accepted: boolean, valid: boolean}>}
   */
  async isUserLicenceValid (request) {
    return this.userAccountRepository.verifyLicenseValid(this.getUsername(request))
  }

  /**
   * @param request
   * @return {Promise<boolean>}
   */
  async setUserLicenceAccepted (request) {
    return this.userAccountRepository.setLicenceAcceptedDate(this.getUsername(request))
  }

  /**
   * @param request
   * @return {Promise<boolean>}
   */
  async isUserEmailVerified (request) {
    return this.userAccountRepository.isEmailVerified(this.getUsername(request))
  }

  /**
   * @param request
   * @return {Promise<void>}
   */
  async sendVerifyEmail (request) {
    const username = this.getUsername(request)
    const oneTimeCode = this.generateOneTimeCode()

    await this.userAccountRepository.setActivationCodeAndExpiry(username, oneTimeCode, expiryInMinsForOtp)

    const data = {
      toAddress: username,
      type: emailTypes.verifyEmail,
      customFields: [
        { name: 'one_time_code', value: oneTimeCode },
        { name: 'expiry_in_mins', value: expiryInMinsForOtp }
      ]
    }
    await sendEmail(data)
  }
}

module.exports = {
  RegistrationService,
  actionResults
}
