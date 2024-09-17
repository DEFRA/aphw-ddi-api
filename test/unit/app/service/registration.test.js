describe('RegistrationService', function () {
  /**
   * @type {UserAccountRepository}
   */
  let mockUserAccountRepository
  let regService

  jest.mock('../../../../app/messaging/send-email')
  const { sendEmail } = require('../../../../app/messaging/send-email')

  const { RegistrationService } = require('../../../../app/service/registration')

  beforeEach(function () {
    jest.clearAllMocks()
    sendEmail.mockResolvedValue()

    // Create a mock UserAccountRepository
    /**
     * @type {UserAccountRepository}
     */
    mockUserAccountRepository = {
      getAccount: jest.fn()
    }

    // Instantiate RegistrationService with the mock repository
    regService = new RegistrationService(mockUserAccountRepository)
  })

  describe('generateOneTimeCode', function () {
    test('should return a random code between 1 and 999999', () => {
      let result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
    })
  })

  describe('sendVerifyEmailAddress', function () {
    test('should send code in email', async () => {
      await regService.SendVerifyEmailAddress('user@test.com')
      expect(sendEmail).toHaveBeenCalledWith({
        type: 'verify-email',
        toAddress: 'user@test.com',
        customFields: [
          { name: 'one_time_code', value: expect.anything() },
          { name: 'expiry_in_mins', value: '8' }
        ]
      })
    })
  })

  describe('verifyUserAction', function () {
    test('should send code in email', async () => {
      await regService.SendVerifyEmailAddress('user@test.com')
      expect(sendEmail).toHaveBeenCalledWith({
        type: 'verify-email',
        toAddress: 'user@test.com',
        customFields: [
          { name: 'one_time_code', value: expect.anything() },
          { name: 'expiry_in_mins', value: '8' }
        ]
      })
    })
  })
})
