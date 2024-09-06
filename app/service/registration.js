const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')

const expiryInMinsForOtp = 8

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
   * @type {RegistrationService.SendOneTimeCodeEmail}
   */
  async SendVerifyEmailAddress (username) {
    const oneTimeCode = this.GenerateOneTimeCode()
    this.userAccountRepository.setActivationCode(username, oneTimeCode)
    const data = {
      toAddress: username,
      type: emailTypes.oneTimeCode,
      customFields: [
        { name: 'one_time_code', value: oneTimeCode },
        { name: 'expiry_in_mins', value: expiryInMinsForOtp }
      ]
    }
    await sendEmail(data)
  }
}

module.exports = { RegistrationService }
