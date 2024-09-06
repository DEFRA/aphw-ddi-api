describe('RegistrationService', function () {
  /**
   * @type {UserAccountRepository}
   */
  let mockUserAccountRepository
  let regService

  const { RegistrationService } = require('../../../../app/service/registration')

  beforeEach(function () {
    jest.clearAllMocks()

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
})
