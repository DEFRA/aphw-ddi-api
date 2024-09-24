const { randomInt } = require('crypto')
const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')

const expiryInMinsForOtp = '8'

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
   * @type {RegistrationService.GenerateOneTimeCode}
   */
  generateOneTimeCode () {
    return `${(Math.floor(100000 + randomInt(900000)))}`
  }

  /**
   * @type {RegistrationService.SendVerifyEmailAddress}
   * @param {string} username
   */
  async sendVerifyEmailAddress (username) {
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

  /**
   * @type {RegistrationService.VerifyAccountActivation}
   * @param {string} username
   * @param {string} code
   */
  async verifyAccountActivation (username, oneTimeCode) {
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
   * @type {RegistrationService.VerifyLogin}
   * @param {string} username
   * @param {string} code
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
   * @type {RegistrationService.acceptLicence}
   * @param {string} username
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
}

module.exports = {
  RegistrationService,
  actionResults
}
