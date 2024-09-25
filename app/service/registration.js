const { randomInt } = require('crypto')
const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')
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
   * @type {RegistrationService.getUserFromRequest}
   */
  getUserFromRequest (request) {
    const payload = request.auth?.artifacts?.decoded?.payload
    if (payload) {
      const { username } = payload
      return username
    }
    throw new NotFoundError('user not found')
  }

  /**
   * @type {RegistrationService.generateOneTimeCode}
   */
  generateOneTimeCode () {
    return `${(Math.floor(100000 + randomInt(900000)))}`
  }

  /**
   * @type {RegistrationService.verifyEmailCode}
   * @param request
   */
  async verifyEmailCode (request) {
    const username = this.getUserFromRequest(request)
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

  /**
   * @type {RegistrationService.isUserLicenceAccepted}
   * @param {any} request
   */
  async isUserLicenceAccepted (request) {
    return this.userAccountRepository.verifyLicenceAccepted(this.getUserFromRequest(request))
  }

  /**
   * @type {RegistrationService.setUserLicenceAccepted}
   * @param {any} request
   */
  async setUserLicenceAccepted (request) {
    return this.userAccountRepository.setLicenceAcceptedDate(this.getUserFromRequest(request))
  }

  /**
   * @type {RegistrationService.isUserEmailVerified}
   * @param {any} request
   */
  async isUserEmailVerified (request) {
    return this.userAccountRepository.isEmailVerified(this.getUserFromRequest(request))
  }

  /**
   * @type {RegistrationService.sendVerifyEmail}
   * @param {any} request
   */
  async sendVerifyEmail (request) {
    const username = this.getUserFromRequest(request)
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
