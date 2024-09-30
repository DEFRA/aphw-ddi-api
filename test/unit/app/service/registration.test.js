const { NotFoundError } = require('../../../../app/errors/not-found')

describe('RegistrationService', function () {
  /**
   * @type {UserAccountRepository}
   */
  let mockUserAccountRepository
  let regService

  jest.mock('../../../../app/messaging/send-email')
  const { sendEmail } = require('../../../../app/messaging/send-email')

  const { RegistrationService, actionResults } = require('../../../../app/service/registration')

  const request = {
    auth: {
      artifacts: {
        decoded: {
          header: { alg: 'RS256', typ: 'JWT', kid: 'aphw-ddi-enforcement' },
          payload: {
            scope: ['Dog.Index.Enforcement'],
            username: 'dev-user@test.com',
            displayname: 'Dev User',
            token: 'abcdef',
            iat: 1726587632,
            exp: 1726591232,
            aud: 'aphw-ddi-api',
            iss: 'aphw-ddi-enforcement'
          },
          signature: 'abcdef'
        }
      },
      credentials: {
        user: 'dev-user@test.com',
        displayname: 'Dev User'
      }
    },
    headers: {
      'ddi-username': 'dev-user@test.com',
      'ddi-displayname': 'Dev User'
    }
  }

  beforeEach(function () {
    jest.clearAllMocks()
    sendEmail.mockResolvedValue()

    // Create a mock UserAccountRepository
    /**
     * @type {UserAccountRepository}
     */
    mockUserAccountRepository = {
      getAccount: jest.fn(),
      setActivationCodeAndExpiry: jest.fn(),
      setActivatedDate: jest.fn(),
      setLoginDate: jest.fn(),
      verifyLicenceAccepted: jest.fn(),
      setLicenceAcceptedDate: jest.fn(),
      isEmailVerified: jest.fn()
    }

    // Instantiate RegistrationService with the mock repository
    regService = new RegistrationService(mockUserAccountRepository)
  })

  describe('generateOneTimeCode', function () {
    test('should return a random code between 1 and 999999', () => {
      let result = regService.generateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.generateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.generateOneTimeCode()
      expect(result.length).toEqual(6)
    })
  })

  describe('sendVerifyEmail', function () {
    test('should send code in email', async () => {
      await regService.sendVerifyEmail(request)
      expect(sendEmail).toHaveBeenCalledWith({
        type: 'verify-email',
        toAddress: 'dev-user@test.com',
        customFields: [
          { name: 'one_time_code', value: expect.anything() },
          { name: 'expiry_in_mins', value: '60' }
        ]
      })
    })
  })

  describe('verifyEmailCode', function () {
    test('should return ACCOUNT_NOT_FOUND if no account', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue(null)
      const res = await regService.verifyEmailCode(request)
      expect(res).toBe(actionResults.ACCOUNT_NOT_FOUND)
    })

    test('should return ACCOUNT_NOT_ENABLED if account not enabled', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: false })
      const res = await regService.verifyEmailCode(request)
      expect(res).toBe(actionResults.ACCOUNT_NOT_ENABLED)
    })

    test('should return ACTIVATION_CODE_EXPIRED if code expired', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() - 1 })
      const req = { ...request, payload: { code: '123456' } }
      const res = await regService.verifyEmailCode(req)
      expect(res).toBe(actionResults.ACTIVATION_CODE_EXPIRED)
    })

    test('should return INVALID_ACTIVATION_CODE if wrong code', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() + 1 })
      const req = { ...request, payload: { code: '111111' } }
      const res = await regService.verifyEmailCode(req)
      expect(res).toBe(actionResults.INVALID_ACTIVATION_CODE)
    })

    test('should return OK if everything is good', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() + 1 })
      const req = { ...request, payload: { code: '123456' } }
      const res = await regService.verifyEmailCode(req)
      expect(res).toBe(actionResults.OK)
    })
  })

  describe('verifyLogin', function () {
    test('should return ACCOUNT_NOT_FOUND if no account', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue(null)
      const res = await regService.verifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_FOUND)
    })

    test('should return ACCOUNT_NOT_ENABLED if account not enabled', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: false })
      const res = await regService.verifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ENABLED)
    })

    test('should return ACCOUNT_NOT_ACTIVATED if account not activated', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true })
      const res = await regService.verifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ACTIVATED)
    })

    test('should return MUST_ACCEPT_TS_AND_CS if terms and conds not accepted yet', async () => {
      const mockSave = jest.fn()
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), save: mockSave })
      const res = await regService.verifyLogin('user@test.com')
      expect(res).toBe(actionResults.MUST_ACCEPT_TS_AND_CS)
    })

    test('should return OK if all good', async () => {
      const mockSave = jest.fn()
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), accepted_terms_and_conds_date: new Date(), save: mockSave })
      const res = await regService.verifyLogin('user@test.com')
      expect(res).toBe(actionResults.OK)
    })
  })

  describe('acceptLicence', function () {
    test('should return ACCOUNT_NOT_FOUND if no account', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue(null)
      const res = await regService.acceptLicence('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_FOUND)
    })

    test('should return ACCOUNT_NOT_ENABLED if account not enabled', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: false })
      const res = await regService.acceptLicence('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ENABLED)
    })

    test('should return OK if accepted ok', async () => {
      mockUserAccountRepository.setLicenceAcceptedDate.mockResolvedValue(true)
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), accepted_terms_and_conds_date: new Date() })
      const res = await regService.acceptLicence('user@test.com')
      expect(res).toBe(actionResults.OK)
    })

    test('should return ERROR if not ok', async () => {
      mockUserAccountRepository.setLicenceAcceptedDate.mockResolvedValue(false)
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), accepted_terms_and_conds_date: new Date() })
      const res = await regService.acceptLicence('user@test.com')
      expect(res).toBe(actionResults.ERROR)
    })
  })

  describe('userVerifyLicenceAccepted', () => {
    test('should extract username', async () => {
      mockUserAccountRepository.verifyLicenceAccepted.mockResolvedValue(true)
      const res = await regService.isUserLicenceAccepted(request)
      expect(res).toBeTruthy()
      expect(mockUserAccountRepository.verifyLicenceAccepted).toHaveBeenCalledWith('dev-user@test.com')
    })

    test('should throw if cannot extract username', async () => {
      mockUserAccountRepository.verifyLicenceAccepted.mockResolvedValue(true)
      await expect(regService.isUserLicenceAccepted({ auth: null })).rejects.toThrow(new NotFoundError('user not found'))
    })
  })

  describe('userSetLicenceAccepted', () => {
    test('should extract username', async () => {
      mockUserAccountRepository.setLicenceAcceptedDate.mockResolvedValue(true)
      const res = await regService.setUserLicenceAccepted(request)
      expect(res).toBeTruthy()
      expect(mockUserAccountRepository.setLicenceAcceptedDate).toHaveBeenCalledWith('dev-user@test.com')
    })

    test('should throw if cannot extract username', async () => {
      mockUserAccountRepository.setLicenceAcceptedDate.mockResolvedValue(true)
      await expect(regService.setUserLicenceAccepted({ auth: null })).rejects.toThrow(new NotFoundError('user not found'))
    })
  })

  describe('isUserEmailVerified', () => {
    test('should extract username', async () => {
      mockUserAccountRepository.isEmailVerified.mockResolvedValue(true)
      const res = await regService.isUserEmailVerified(request)
      expect(res).toBeTruthy()
      expect(mockUserAccountRepository.isEmailVerified).toHaveBeenCalledWith('dev-user@test.com')
    })

    test('should return false if cannot extract username', async () => {
      mockUserAccountRepository.isEmailVerified.mockResolvedValue(true)
      await expect(regService.isUserEmailVerified({ auth: null })).rejects.toThrow(new NotFoundError('user not found'))
    })
  })
})
