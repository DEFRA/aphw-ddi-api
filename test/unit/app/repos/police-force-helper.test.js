const { devUser } = require('../../../mocks/auth')

describe('Police force helper', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      registration: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
      },
      registered_person: {
        findAll: jest.fn()
      },
      search_index: {
        update: jest.fn()
      },
      police_force: {
        findOne: jest.fn()
      },
      police_force_group: {
        findOne: jest.fn()
      },
      police_force_group_item: {
        findOne: jest.fn(),
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/import/robot/police')
  const { lookupPoliceForceByPostcode, matchPoliceForceByName } = require('../../../../app/import/robot/police')

  jest.mock('../../../../app/repos/user-accounts')
  const { getAccount } = require('../../../../app/repos/user-accounts')

  const { setPoliceForceOnCdos, hasForceChanged, getUsersForceList, getUsersForceGroupName } = require('../../../../app/repos/police-force-helper')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendUpdateToAudit.mockResolvedValue()
  })

  describe('setPoliceForceOnCdos', () => {
    test('should ignore if no new force', async () => {
      const newPoliceForce = {}
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1000, police_force: null })

      const res = await setPoliceForceOnCdos(newPoliceForce, ['ED456'], devUser, {})

      expect(res).toBeFalsy()
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(0)
    })

    test('should handle one dog when new force is different to existing', async () => {
      const newPoliceForce = {
        id: 20,
        name: 'New force'
      }
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1000, police_force: { id: 123, name: 'Old force' } })

      const res = await setPoliceForceOnCdos(newPoliceForce, ['ED456'], devUser, {})

      expect(res).toBeTruthy()
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 20 }, { transaction: {}, where: { id: 1000 } })
    })

    test('should handle multiple dogs when new force is different to at least one of existing', async () => {
      const newPoliceForce = {
        id: 20,
        name: 'New force'
      }
      sequelize.models.registration.findOne
        .mockResolvedValueOnce({ id: 1000, police_force: { id: 20, name: 'New force' } })
        .mockResolvedValueOnce({ id: 1201, police_force: { id: 123, name: 'Old force' } })

      const res = await setPoliceForceOnCdos(newPoliceForce, ['ED456', 'ED789'], devUser, {})

      expect(res).toBeTruthy()
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(1)
      expect(sequelize.models.registration.update).toHaveBeenNthCalledWith(1, { police_force_id: 20 }, { transaction: {}, where: { id: 1201 } })
    })

    test('should set new force when no existing force set', async () => {
      const newPoliceForce = {
        id: 20,
        name: 'New force'
      }
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1000, police_force: null })

      const res = await setPoliceForceOnCdos(newPoliceForce, ['ED456'], devUser, {})

      expect(res).toBeTruthy()
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 20 }, { transaction: {}, where: { id: 1000 } })
    })
  })

  describe('hasForceChanged', () => {
    test('should handle owner with no dogs', async () => {
      const person = {}
      sequelize.models.registered_person.findAll.mockResolvedValue([])
      sequelize.models.registration.findAll.mockResolvedValue([])

      const res = await hasForceChanged(123, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeFalsy()
      expect(res.reason).toBe('No dogs')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(0)
    })

    test('should handle owner with one dog but no change needed for police force', async () => {
      const person = { address: { country: 'England', postcode: 'TS1 1TS' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }])
      sequelize.models.registration.findAll.mockResolvedValue([{ police_force_id: 20, police_force: { id: 20, name: 'Old force' } }])
      lookupPoliceForceByPostcode.mockResolvedValue({ id: 20, name: 'Old force' })
      matchPoliceForceByName.mockResolvedValue({ id: 20, name: 'Old force' })
      const res = await hasForceChanged(123, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeFalsy()
      expect(res.reason).toBe('Same as existing')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(0)
    })

    test('should handle owner with one dog that needs police force changing', async () => {
      const person = { address: { country: 'England', postcode: 'TS1 1TS' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }])
      sequelize.models.registration.findAll.mockResolvedValue([{ police_force_id: 20, police_force: { id: 20, name: 'Old force' } }])
      lookupPoliceForceByPostcode.mockResolvedValue({ id: 25, name: 'New force' })
      matchPoliceForceByName.mockResolvedValue({ id: 20, name: 'Old force' })
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1255, police_force: 20 })

      const res = await hasForceChanged(12345, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeTruthy()
      expect(res.reason).toBe(undefined)
      expect(res.policeForceName).toBe('New force')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(1)
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 25 }, { transaction: {}, where: { id: 1255 } })
    })

    test('should handle owner with one dog that needs police force changing - previously unset police force', async () => {
      const person = { address: { country: 'England', postcode: 'TS1 1TS' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }])
      sequelize.models.registration.findAll.mockResolvedValue([{ }])
      lookupPoliceForceByPostcode.mockResolvedValue({ id: 25, name: 'New force' })
      matchPoliceForceByName.mockResolvedValue({ id: 20, name: 'Old force' })
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1255, police_force: 20 })

      const res = await hasForceChanged(12345, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeTruthy()
      expect(res.reason).toBe(undefined)
      expect(res.policeForceName).toBe('New force')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(1)
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 25 }, { transaction: {}, where: { id: 1255 } })
    })

    test('should handle owner with one dog moving to scotland', async () => {
      const person = { address: { country: 'Scotland', postcode: 'EH1 1AA' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }])
      sequelize.models.registration.findAll.mockResolvedValue([{ }])
      lookupPoliceForceByPostcode.mockResolvedValue({ id: 25, name: 'New force' })
      matchPoliceForceByName.mockResolvedValue({ id: 30, name: 'Police scotland' })
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1255, police_force: 20 })

      const res = await hasForceChanged(12345, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeTruthy()
      expect(res.reason).toBe(undefined)
      expect(res.policeForceName).toBe('Police scotland')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(1)
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 30 }, { transaction: {}, where: { id: 1255 } })
    })

    test('should handle owner with one dog and failed postcode lookup', async () => {
      const person = { address: { country: 'England', postcode: 'BD1 1BD' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }])
      sequelize.models.registration.findAll.mockResolvedValue([{ }])
      lookupPoliceForceByPostcode.mockResolvedValue({ })
      matchPoliceForceByName.mockResolvedValue({ })
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1255, police_force: 20 })

      const res = await hasForceChanged(12345, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeFalsy()
      expect(res.reason).toBe('Not found')
      expect(res.policeForceName).toBe(undefined)
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(0)
    })

    test('should handle owner with multiple dogs that need police force changing', async () => {
      const person = { address: { country: 'England', postcode: 'TS1 1TS' } }
      sequelize.models.registered_person.findAll.mockResolvedValue([{ dog_id: 123 }, { dog_id: 457 }, { dog_id: 789 }])
      sequelize.models.registration.findAll.mockResolvedValue([
        { police_force_id: 20, police_force: { id: 20, name: 'Old force' } },
        { police_force_id: 21, police_force: { id: 21, name: 'Other force' } },
        { police_force_id: 20, police_force: { id: 20, name: 'Old force' } }
      ])
      lookupPoliceForceByPostcode.mockResolvedValue({ id: 25, name: 'New force' })
      matchPoliceForceByName.mockResolvedValue({ id: 20, name: 'Old force' })
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1255, police_force: 20 })

      const res = await hasForceChanged(12345, person, devUser, {})

      expect(res).not.toBe(null)
      expect(res.changed).toBeTruthy()
      expect(res.reason).toBe(undefined)
      expect(res.policeForceName).toBe('New force')
      expect(sequelize.models.registration.update).toHaveBeenCalledTimes(3)
      expect(sequelize.models.registration.update).toHaveBeenNthCalledWith(1, { police_force_id: 25 }, { transaction: {}, where: { id: 1255 } })
      expect(sequelize.models.registration.update).toHaveBeenNthCalledWith(2, { police_force_id: 25 }, { transaction: {}, where: { id: 1255 } })
      expect(sequelize.models.registration.update).toHaveBeenNthCalledWith(3, { police_force_id: 25 }, { transaction: {}, where: { id: 1255 } })
    })
  })

  describe('getUsersForceList', () => {
    test('returns undefined if no police force set', async () => {
      getAccount.mockResolvedValue()
      const res = await getUsersForceList(devUser)
      expect(res).toBe(undefined)
    })

    test('returns single force if force is not joined with others', async () => {
      getAccount.mockResolvedValue({ police_force_id: 123 })
      sequelize.models.police_force_group_item.findOne.mockResolvedValue()
      const res = await getUsersForceList(devUser)
      expect(res).toEqual([123])
    })

    test('returns list of forces if force is joined with others', async () => {
      getAccount.mockResolvedValue({ police_force_id: 22 })
      sequelize.models.police_force_group_item.findOne.mockResolvedValue({ police_force_group_id: 12 })
      sequelize.models.police_force_group_item.findAll.mockResolvedValue([
        { police_force_group_id: 12, police_force_id: 1 },
        { police_force_group_id: 12, police_force_id: 22 },
        { police_force_group_id: 12, police_force_id: 3 }
      ])
      const res = await getUsersForceList(devUser)
      expect(res).toEqual([1, 22, 3])
    })
  })

  describe('getUsersForceGroupName', () => {
    test('returns undefined if no police force set', async () => {
      getAccount.mockResolvedValue({ police_force_id: null })
      const res = await getUsersForceGroupName(devUser.username)
      expect(res).toBe(undefined)
    })

    test('returns undefined if force set but invalid', async () => {
      getAccount.mockResolvedValue({ police_force_id: 999 })
      sequelize.models.police_force.findOne.mockResolvedValue()
      sequelize.models.police_force_group_item.findOne.mockResolvedValue()
      const res = await getUsersForceGroupName(devUser.username)
      expect(res).toBe(undefined)
    })

    test('returns single force if force is not joined with others', async () => {
      getAccount.mockResolvedValue({ police_force_id: 123 })
      sequelize.models.police_force.findOne.mockResolvedValue({ police_force_id: 123, name: 'Test Force 1' })
      sequelize.models.police_force_group_item.findOne.mockResolvedValue()
      const res = await getUsersForceGroupName(devUser.username)
      expect(res).toEqual('Test Force 1')
    })

    test('returns group force name if force is joined with others', async () => {
      getAccount.mockResolvedValue({ police_force_id: 22 })
      sequelize.models.police_force_group_item.findOne.mockResolvedValue({ police_force_group_id: 12 })
      sequelize.models.police_force_group_item.findAll.mockResolvedValue([
        { police_force_group_id: 12, police_force_id: 1 },
        { police_force_group_id: 12, police_force_id: 22 },
        { police_force_group_id: 12, police_force_id: 3 }
      ])
      sequelize.models.police_force_group.findOne.mockResolvedValue({ display_text: 'Force 1 and Force 2 grouped' })
      const res = await getUsersForceGroupName(devUser.username)
      expect(res).toEqual('Force 1 and Force 2 grouped')
    })
  })
})
