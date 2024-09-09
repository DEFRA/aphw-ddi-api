const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')

const expiryInMinsForOtp = '8'

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
  GenerateOneTimeCode () {
    return `${(Math.floor(100000 + Math.random() * 900000))}`
  }

  /**
   * @type {RegistrationService.SendVerifyEmailAddress}
   * @param {string} username
   */
  async SendVerifyEmailAddress (username) {
    const oneTimeCode = this.GenerateOneTimeCode()
    // TODO this.userAccountRepository.setActivationCodeAndExpiry(username, oneTimeCode)
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
   * @type {RegistrationService.VerifyUserAction}
   * @param {string} username
   * @param {string} code
   */
  async VerifyUserAction (username, oneTimeCode) {
    const user = {} // this.userAccountRepository.getUser(username)
    if (!user) {
      return false
    }
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

module.exports = { RegistrationService }
