const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { buildUserAccount } = require('../../../mocks/user-accounts')
const { buildPoliceForceDao } = require('../../../mocks/cdo/get')

describe('user-accounts', () => {
  const dummyAdminUser = {
    username: 'dummy-user',
    displayname: 'Dummy User'
  }

  jest.mock('../../../../app/lookups')
  const { getPoliceForce } = require('../../../../app/lookups')

  jest.mock('../../../../app/messaging/send-email')
  const { sendEmail } = require('../../../../app/messaging/send-email')

  jest.mock('../../../../app/config/db', () => ({
    literal: jest.fn(),
    col: jest.fn(),
    models: {
      user_account: {
        findAll: jest.fn(),
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
    sendEmail.mockResolvedValue()
  })

  const { getAccounts, createAccount, createAccounts, deleteAccount, isAccountEnabled, getAccount, setActivationCodeAndExpiry, setLoginDate, setActivatedDate, setLicenceAcceptedDate, verifyLicenseValid, isEmailVerified, getPoliceForceIdForAccount } = require('../../../../app/repos/user-accounts')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getAccounts', () => {
    const ralph = buildUserAccount({
      id: 1,
      username: 'ralph@wreckit.com'
    })
    const turner = buildUserAccount({
      id: 2,
      username: 'scott.turner@sacramento.police.gov',
      police_force_id: 2,
      police_force: buildPoliceForceDao({
        id: 2,
        name: 'Sacramento Police Department',
        short_name: 'sacramento'
      })
    })
    const axelFoley = buildUserAccount({
      id: 3,
      username: 'axel.foley@beverly-hills.police.gov',
      police_force_id: 3,
      police_force: buildPoliceForceDao({
        id: 3,
        name: 'Beverly Hills Police Department',
        short_name: 'beverly-hills'
      })
    })

    test('should get a list of accounts', async () => {
      const userAccounts = [
        ralph,
        turner,
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts()
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should filter accounts by multiple results', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts({
        username: 'axel.foley@beverly-hills.police.gov',
        policeForceId: 3,
        policeForce: 'Beverly Hills Police Department'
      })
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        where: {
          username: 'axel.foley@beverly-hills.police.gov',
          police_force_id: 3,
          '$police_force.name$': 'Beverly Hills Police Department'
        },
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should filter accounts by forceId', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts({ policeForceId: 3 })
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        where: {
          police_force_id: 3
        },
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should filter accounts by forceName', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts({ policeForce: 'Beverly Hills Police Department' })
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        where: {
          '$police_force.name$': 'Beverly Hills Police Department'
        },
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should filter accounts by username', async () => {
      const userAccounts = [
        ralph
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts({ username: 'ralph@wreckit.com' })
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        where: {
          username: 'ralph@wreckit.com'
        },
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should ignore filter if invalid key', async () => {
      const userAccounts = [
        ralph
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      const returnedAccounts = await getAccounts({ invalidkey: 'ralph@wreckit.com' })
      expect(returnedAccounts).toEqual(userAccounts)
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should sort accounts by email', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { username: 'ASC' })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })

    test('should sort accounts by activated=true', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { activated: true })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [undefined, ['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
      expect(sequelize.literal).toHaveBeenCalledWith('CASE WHEN (accepted_terms_and_conds_date IS NULL AND activated_date IS NULL) THEN 4 WHEN activated_date IS NULL THEN 3 WHEN accepted_terms_and_conds_date IS NULL THEN 2 ELSE 1 END ASC')
    })

    test('should sort accounts by activated=false', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { activated: false })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [undefined, ['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
      expect(sequelize.literal).toHaveBeenCalledWith('CASE WHEN (accepted_terms_and_conds_date IS NULL AND activated_date IS NULL) THEN 4 WHEN activated_date IS NULL THEN 3 WHEN accepted_terms_and_conds_date IS NULL THEN 2 ELSE 1 END DESC')
    })

    test('should sort accounts by police force DESC', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { policeForce: 'DESC' })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [[undefined, 'DESC'], ['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('police_force.name')
    })

    test('should sort accounts by police force DESC', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { policeForce: 'ASC' })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [[undefined, 'ASC'], ['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('police_force.name')
    })

    test('should ignore sort if invalid key', async () => {
      const userAccounts = [
        axelFoley
      ]
      sequelize.models.user_account.findAll.mockResolvedValue(userAccounts)
      await getAccounts({}, { invalidkey: 'DESC' })
      expect(sequelize.models.user_account.findAll).toHaveBeenCalledWith({
        order: [['username', 'ASC']],
        include: {
          model: sequelize.models.police_force,
          as: 'police_force'
        }
      })
    })
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
      expect(sendEmail).toHaveBeenCalledWith({
        customFields: [{ name: 'ddi_url', value: 'https://enforcement.com' }],
        toAddress: 'bill@gotham-city.police.uk',
        type: 'user-invite'
      })
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
    test('should create accounts', async () => {
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
        items: [
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
        ],
        errors: undefined
      })
    })

    test('should return failures if there was an issue', async () => {
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
        items: [],
        errors: [
          {
            data: { username: 'joe.bloggs@avonandsomerset.police.uk' },
            statusCode: 409,
            error: 'Conflict',
            message: 'This user is already in the allow list'
          },
          {
            data: { username: 'jane.doe@avonandsomerset.police.uk' },
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An internal server error occurred'
          },
          {
            data: { username: 'john.smith@example.com' },
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'not found error'
          }
        ]
      })
    })
  })

  describe('getPoliceForceIdForAccount', () => {
    test('should handle empty username ', async () => {
      const result = await getPoliceForceIdForAccount({})
      expect(result).toBeUndefined()
    })
  })

  describe('isAccountEnabled', () => {
    test('should return true if active', async () => {
      const mockUserAccount = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: true,
        last_login_date: new Date('2024-09-02')
      }
      sequelize.models.user_account.findOne.mockResolvedValue(mockUserAccount)

      const result = await isAccountEnabled('test@example.com')
      expect(result).toEqual([true, mockUserAccount])
    })

    test('should return false if user exists and activated but not active', async () => {
      const mockUserAccount = {
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        active: false,
        last_login_date: new Date('2024-09-02')
      }
      sequelize.models.user_account.findOne.mockResolvedValue(mockUserAccount)

      const result = await isAccountEnabled('test@example.com')
      expect(result).toEqual([false, mockUserAccount])
    })

    test('should return false if user does not exist', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const result = await isAccountEnabled('test@example.com')
      expect(result).toEqual([false, null])
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

  describe('verifyLicenceValid', () => {
    test('should return true if the license was accepted less than a year ago', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2023-09-01'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        accepted_terms_and_conds_date: new Date()
      })

      const result = await verifyLicenseValid('test@example.com')
      expect(result).toEqual({
        accepted: true,
        valid: true
      })
    })

    test('should return false if the license was accepted over a year ago', async () => {
      const aYearAgo = new Date()
      aYearAgo.setUTCFullYear(aYearAgo.getFullYear() - 1)
      aYearAgo.setUTCDate(aYearAgo.getUTCDate() + 1)
      aYearAgo.setUTCHours(0)
      aYearAgo.setUTCMinutes(0)
      aYearAgo.setUTCMilliseconds(0)
      aYearAgo.setUTCSeconds(0)
      aYearAgo.setTime(aYearAgo.getTime() - 1)

      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2023-09-01'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        accepted_terms_and_conds_date: aYearAgo
      })

      const result = await verifyLicenseValid('test@example.com')
      expect(result).toEqual({
        accepted: true,
        valid: false
      })
    })

    test('should return true if the license was accepted a day later than a year ago', async () => {
      const almostYearAgo = new Date()
      almostYearAgo.setUTCFullYear(almostYearAgo.getFullYear() - 1)
      almostYearAgo.setUTCDate(almostYearAgo.getUTCDate() + 1)
      almostYearAgo.setUTCHours(23)
      almostYearAgo.setUTCMinutes(59)
      almostYearAgo.setUTCMilliseconds(999)
      almostYearAgo.setUTCSeconds(59)

      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2023-09-01'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        accepted_terms_and_conds_date: almostYearAgo
      })

      const result = await verifyLicenseValid('test@example.com')
      expect(result).toEqual({
        accepted: true,
        valid: true
      })
    })

    test('should return false if the license was not accepted', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2023-10-01'),
        active: true,
        last_login_date: new Date('2024-09-02'),
        accepted_terms_and_conds_date: null
      })

      const result = await verifyLicenseValid('test@example.com')
      expect(result).toEqual({
        accepted: false,
        valid: false
      })
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
