const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
describe('user-accounts', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      user_account: {
        findOne: jest.fn(),
        create: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { createAccount, isAccountEnabled, getAccount, setActivationCodeAndExpiry, setLoginDate, setActivatedDate, setLicenceAcceptedDate, verifyLicenceAccepted } = require('../../../../app/repos/user-accounts')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createAccount', () => {
    test('should use a transaction if none exists', async () => {
      /**
       * @type {UserAccountDto}
       */
      const userDto = {
        username: 'bill@example.com'
      }

      await createAccount(userDto)

      expect(sequelize.transaction).toHaveBeenCalled()
    })

    test('should create an account', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      const transaction = {}
      /**
       * @type {UserAccountDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true
      }

      const expectedUserDto = {
        username: 'bill@example.com',
        active: true
      }

      sequelize.models.user_account.create.mockResolvedValue(expectedUserDto)

      const user = await createAccount(userDto, transaction)

      expect(user).toEqual(expectedUserDto)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(userDto, {})
    })

    test('should reject with duplicate if', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        created_at: '2024-09-25T19:26:14.946Z',
        updated_at: '2024-09-25T19:26:14.946Z',
        id: 3,
        username: 'user@example.com',
        active: true,
        activation_token: null,
        activation_token_expiry: null,
        activated_date: null,
        accepted_terms_and_conds_date: null,
        last_login_date: null,
        deleted_at: null
      })

      const transaction = {}
      /**
       * @type {UserAccountDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true
      }

      const expectedUserDto = {
        username: 'bill@example.com',
        active: true
      }

      sequelize.models.user_account.create.mockResolvedValue(expectedUserDto)

      await expect(createAccount(userDto, transaction)).rejects.toThrow(new DuplicateResourceError('This user is already in the allow list'))
    })
  })

  describe('isAccountEnabled', () => {
    test('should return true if activated date and active', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02')
      })

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(true)
    })

    test('should return false if user exists but is not activated', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: null,
        active: true,
        last_login_date: new Date('2024-09-02')
      })

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(false)
    })

    test('should return false if user exists and activated but not active', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: false,
        last_login_date: new Date('2024-09-02')
      })

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(false)
    })

    test('should return false if user does not exist', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(false)
    })
  })

  describe('getAccount', () => {
    test('should return account', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02')
      })

      const result = await getAccount('test@example.com')
      expect(result).toEqual({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02')
      })
    })
  })

  describe('setActivationCodeAndExpiry', () => {
    test('should save if account exists', async () => {
      const mockSave = jest.fn()
      const account = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        save: mockSave
      }
      sequelize.models.user_account.findOne.mockResolvedValue(account)

      const expiry = new Date() + 1
      const res = await setActivationCodeAndExpiry('test@example.com', '123456', expiry)
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(account.activation_token).toBe('123456')
      expect(res).toBeTruthy()
    })

    test('should not save if account doesnt exist, but shouldnt throw', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const expiry = new Date() + 1
      const res = await setActivationCodeAndExpiry('test@example.com', '123456', expiry)
      expect(res).toBeFalsy()
    })
  })

  describe('setLoginDate', () => {
    test('should save if account exists', async () => {
      const mockSave = jest.fn()
      const account = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: null,
        save: mockSave
      }
      sequelize.models.user_account.findOne.mockResolvedValue(account)

      const res = await setLoginDate('test@example.com')
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(res).toBeTruthy()
    })

    test('should not save if account doesnt exist, but shouldnt throw', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const res = await setLoginDate('test@example.com')
      expect(res).toBeFalsy()
    })
  })

  describe('setActivatedDate', () => {
    test('should save if account exists', async () => {
      const mockSave = jest.fn()
      const account = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: null,
        save: mockSave
      }
      sequelize.models.user_account.findOne.mockResolvedValue(account)

      const res = await setActivatedDate('test@example.com')
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(res).toBeTruthy()
    })

    test('should not save if account doesnt exist, but shouldnt throw', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const res = await setActivatedDate('test@example.com')
      expect(res).toBeFalsy()
    })
  })

  describe('setLicenceAcceptedDate', () => {
    test('should save if account exists', async () => {
      const mockSave = jest.fn()
      const account = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: null,
        save: mockSave
      }
      sequelize.models.user_account.findOne.mockResolvedValue(account)

      const res = await setLicenceAcceptedDate('test@example.com')
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(res).toBeTruthy()
    })

    test('should not save if account doesnt exist, but shouldnt throw', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const res = await setLicenceAcceptedDate('test@example.com')
      expect(res).toBeFalsy()
    })
  })

  describe('verifyLicenceAccepted', () => {
    test('should return true if accepted date', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        accepted_terms_and_conds_date: new Date()
      })

      const result = await verifyLicenceAccepted('test@example.com')
      expect(result).toBe(true)
    })

    test('should return false if not accepted', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: null,
        active: true,
        last_login_date: new Date('2024-09-02')
      })

      const result = await verifyLicenceAccepted('test@example.com')
      expect(result).toBe(false)
    })
  })
})
