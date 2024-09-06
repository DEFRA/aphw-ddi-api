const { emailTypes } = require('../constants/email-types')
const { sendEmail } = require('../messaging/send-email')

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
  async SendOneTimeCodeEmail (username) {
    const oneTimeCode = this.GenerateOneTimeCode()
    this.userAccountRepository.setActivationCode(username, oneTimeCode)
    const data = {
      toAddress: username,
      type: emailTypes.oneTimeCode,
      customFields: [
        { name: 'oneTimeCode', value: oneTimeCode }
      ]
    }
    await sendEmail(data)
  }
}

module.exports = { RegistrationService }
