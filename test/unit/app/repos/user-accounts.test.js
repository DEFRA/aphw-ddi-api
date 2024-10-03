const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { buildUserAccount } = require('../../../mocks/user-accounts')

describe('user-accounts', () => {
  const dummyAdminUser = {
    username: 'dummy-user',
    displayname: 'Dummy User'
  }

  jest.mock('../../../../app/lookups')
  const { getPoliceForce } = require('../../../../app/lookups')

  jest.mock('../../../../app/config/db', () => ({
    models: {
      user_account: {
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  jest.mock('../../../../app/dto/auditing/user')
  const { createUserAccountAudit, deleteUserAccountAudit } = require('../../../../app/dto/auditing/user')

  jest.mock('../../../../app/repos/police-forces')
  const { getPoliceForceByShortName } = require('../../../../app/repos/police-forces')

  const sequelize = require('../../../../app/config/db')

  beforeEach(() => {
    getPoliceForceByShortName.mockResolvedValue(null)
  })

  const { createAccount, createAccounts, deleteAccount, isAccountEnabled, getAccount, setActivationCodeAndExpiry, setLoginDate, setActivatedDate, setLicenceAcceptedDate, verifyLicenceAccepted, isEmailVerified } = require('../../../../app/repos/user-accounts')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createAccount', () => {
    test('should use a transaction if none exists', async () => {
      sequelize.transaction.mockImplementation(async (localCallback) => {
        await localCallback({})
      })
      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@example.com'
      }

      await createAccount(userDto, dummyAdminUser)

      expect(sequelize.transaction).toHaveBeenCalled()
    })

    test('should create an account with no linked police force', async () => {
      /**
       * @type {UserAccount}
       */
      const createDao = buildUserAccount({
        username: 'bill@example.com'
      })
      sequelize.models.user_account.create.mockResolvedValue(createDao)
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      const transaction = {}
      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true
      }

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(createDao)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(userDto, {})
      expect(createUserAccountAudit).toHaveBeenCalledWith(createDao, dummyAdminUser)
      expect(getPoliceForceByShortName).toHaveBeenCalledWith('example.com', {})
    })

    test('should create an account with linked police force from title', async () => {
      /**
       * @type {UserAccount}
       */
      const createDao = buildUserAccount({
        username: 'bill@example.com',
        active: true,
        police_force_id: 1
      })
      sequelize.models.user_account.create.mockResolvedValue(createDao)
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      getPoliceForce.mockResolvedValue({
        id: 1,
        name: 'Gotham City Police Department'
      })
      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true,
        police_force: 'Gotham City Police Department'
      }

      const expectedUserDto = {
        username: 'bill@example.com',
        active: true,
        police_force_id: 1
      }

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(createDao)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(expectedUserDto, {})
      expect(createUserAccountAudit).toHaveBeenCalledWith(createDao, dummyAdminUser)
    })

    test('should create an account with linked police force from police.uk email', async () => {
      getPoliceForceByShortName.mockResolvedValue({
        id: 1,
        name: 'Gotham City Police Department',
        domain: 'bill@gotham-city.police.uk'
      })
      /**
       * @type {UserAccount}
       */
      const createDao = buildUserAccount({
        username: 'bill@gotham-city.police.uk',
        active: true,
        police_force_id: 1
      })
      sequelize.models.user_account.create.mockResolvedValue(createDao)
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@gotham-city.police.uk',
        active: true
      }

      const expectedUserDto = {
        username: 'bill@gotham-city.police.uk',
        active: true,
        police_force_id: 1
      }

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(createDao)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(expectedUserDto, {})
      expect(getPoliceForceByShortName).toHaveBeenCalledWith('gotham-city', {})
    })

    test('should create an account with linked police force from pnn.police.uk email', async () => {
      getPoliceForceByShortName.mockResolvedValue({
        id: 1,
        name: 'Gotham City Police Department',
        domain: 'bill@gotham-city.pnn.police.uk'
      })
      /**
       * @type {UserAccount}
       */
      const createDao = buildUserAccount({
        username: 'bill@gotham-city.pnn.police.uk',
        active: true,
        police_force_id: 1
      })
      sequelize.models.user_account.create.mockResolvedValue(createDao)
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@gotham-city.pnn.police.uk',
        active: true
      }

      const expectedUserDto = {
        username: 'bill@gotham-city.pnn.police.uk',
        active: true,
        police_force_id: 1
      }

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(createDao)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(expectedUserDto, {})
      expect(getPoliceForceByShortName).toHaveBeenCalledWith('gotham-city', {})
    })

    test('should use police force id if provided', async () => {
      const userUpdateDto = {
        username: 'detective.gordon@gotham.police.gov',
        active: true,
        police_force_id: 1
      }
      /**
       * @type {UserAccount}
       */
      const expectedUserDao = buildUserAccount(userUpdateDto)
      sequelize.models.user_account.create.mockResolvedValue(expectedUserDao)
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'detective.gordon@gotham.police.gov',
        active: true,
        police_force_id: 1,
        police_force: 'Gotham City Police Department'
      }

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(expectedUserDao)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(userUpdateDto, {})
      expect(getPoliceForce).not.toHaveBeenCalled()
      expect(createUserAccountAudit).toHaveBeenCalledWith(expectedUserDao, dummyAdminUser)
    })

    test('should fail if police force name does not exist', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      const expectedPoliceForce = 'Gotham City Police Department'

      getPoliceForce.mockResolvedValue(null)

      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true,
        police_force: expectedPoliceForce
      }

      const expectedUserDto = {
        username: 'bill@example.com',
        active: true,
        police_force_id: 1
      }

      sequelize.models.user_account.create.mockResolvedValue(expectedUserDto)

      await expect(createAccount(userDto, dummyAdminUser, transaction)).rejects.toThrow(new NotFoundError(`${expectedPoliceForce} not found`))
    })

    test('should create an account with linked police force from police force name', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      const expectedPoliceForce = 'Gotham City Police Department'

      getPoliceForce.mockResolvedValue({
        id: 1,
        name: expectedPoliceForce
      })

      const transaction = {}

      /**
       * @type {UserAccountRequestDto}
       */
      const userDto = {
        username: 'bill@example.com',
        active: true,
        police_force: expectedPoliceForce
      }

      const expectedUserDto = {
        username: 'bill@example.com',
        active: true,
        police_force_id: 1
      }

      sequelize.models.user_account.create.mockResolvedValue(expectedUserDto)

      const user = await createAccount(userDto, dummyAdminUser, transaction)

      expect(user).toEqual(expectedUserDto)
      expect(sequelize.transaction).not.toHaveBeenCalled()
      expect(sequelize.models.user_account.create).toHaveBeenCalledWith(expectedUserDto, {})
    })

    test('should reject duplicated usernames', async () => {
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
       * @type {UserAccountRequestDto}
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

      await expect(createAccount(userDto, dummyAdminUser, transaction)).rejects.toThrow(new DuplicateResourceError('This user is already in the allow list'))
    })
  })

  describe('deleteAccount', () => {
    test('should use a transaction if none exists', async () => {
      sequelize.transaction.mockImplementation(async (localCallback) => {
        await localCallback({})
      })

      await deleteAccount(1, dummyAdminUser)

      expect(sequelize.transaction).toHaveBeenCalled()
    })

    test('should delete an account', async () => {
      const userAccount = buildUserAccount({
        username: 'user@example.com'
      })
      sequelize.models.user_account.findOne.mockResolvedValue(userAccount)
      await deleteAccount(1, dummyAdminUser, {})

      expect(sequelize.models.user_account.destroy).toHaveBeenCalledWith({ where: { id: 1 }, force: true, transaction: {} })
      expect(deleteUserAccountAudit).toHaveBeenCalledWith(userAccount, dummyAdminUser)
    })

    test('should reject with NotFound error if account does not exist', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      await expect(deleteAccount(1, dummyAdminUser, {})).rejects.toThrow(new NotFoundError('Account does not exist with id 1'))
    })

    test('should throw if audit fails', async () => {
      deleteUserAccountAudit.mockRejectedValue(new Error('audit error'))
      const userAccount = buildUserAccount({
        username: 'user@example.com'
      })
      sequelize.models.user_account.findOne.mockResolvedValue(userAccount)
      await expect(deleteAccount(1, dummyAdminUser, {})).rejects.toThrow(new Error('audit error'))
    })
  })

  describe('createAccounts', () => {
    it('should create accounts', async () => {
      let counter = 1
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      sequelize.transaction.mockImplementation(async (localCallback) => {
        return localCallback({})
      })
      sequelize.models.user_account.create.mockImplementation(async (account) => {
        return {
          id: counter++,
          username: account.username,
          active: true
        }
      })

      const accountsDto = [
        {
          username: 'joe.bloggs@avonandsomerset.police.uk'
        },
        {
          username: 'jane.doe@avonandsomerset.police.uk'
        },
        {
          username: 'john.smith@example.com'
        }
      ]

      const createdAccounts = await createAccounts(accountsDto, dummyAdminUser)
      expect(createdAccounts).toEqual({
        data: {
          accounts: [
            {
              id: 1,
              username: 'joe.bloggs@avonandsomerset.police.uk',
              active: true
            },
            {
              id: 2,
              username: 'jane.doe@avonandsomerset.police.uk',
              active: true
            },
            {
              id: 3,
              username: 'john.smith@example.com',
              active: true
            }
          ]
        },
        errors: undefined
      })
    })
    it('should return failures if there was an issue', async () => {
      sequelize.transaction.mockImplementation(async (localCallback) => {
        return localCallback({})
      })
      sequelize.models.user_account.create.mockRejectedValueOnce(new Error('An internal server error occurred'))
      sequelize.models.user_account.create.mockRejectedValueOnce(new NotFoundError('not found error'))

      sequelize.models.user_account.findOne.mockResolvedValueOnce(buildUserAccount({}))
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const accountsDto = [
        {
          username: 'joe.bloggs@avonandsomerset.police.uk'
        },
        {
          username: 'jane.doe@avonandsomerset.police.uk'
        },
        {
          username: 'john.smith@example.com'
        }
      ]

      const createdAccounts = await createAccounts(accountsDto, dummyAdminUser)
      expect(createdAccounts).toEqual({
        data: { accounts: [] },
        errors: [
          {
            username: 'joe.bloggs@avonandsomerset.police.uk',
            statusCode: 409,
            error: 'Conflict',
            message: 'This user is already in the allow list'
          },
          {
            username: 'jane.doe@avonandsomerset.police.uk',
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An internal server error occurred'
          },
          {
            username: 'john.smith@example.com',
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'not found error'
          }
        ]
      })
    })
  })

  describe('isAccountEnabled', () => {
    test('should return true if active', async () => {
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

  describe('isEmailVerified', () => {
    test('should return true if email has been verified', async () => {
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

      const result = await isEmailVerified('test@example.com')
      expect(result).toBe(true)
    })

    test('should return false if not verified', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: null,
        active: true,
        last_login_date: new Date('2024-09-02')
      })

      const result = await isEmailVerified('test@example.com')
      expect(result).toBe(false)
    })
  })
})
