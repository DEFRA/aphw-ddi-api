const { devUser } = require('../../../../mocks/auth')

describe('Processor wrapper tests', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../../app/config/db', () => ({
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    })
  }))

  jest.mock('../../../../../app/import/robot/processor')
  const { processRegisterRows, populatePoliceForce } = require('../../../../../app/import/robot/processor')

  jest.mock('../../../../../app/import/robot/audit')
  const { generateAuditEvents } = require('../../../../../app/import/robot/audit')
  generateAuditEvents.mockResolvedValue()

  const sequelize = require('../../../../../app/config/db')

  const { processRegister, processRegisterInTransaction } = require('../../../../../app/import/robot/processor-wrapper')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('processRegister should call processRegisterInTransaction', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegister(register, false, devUser)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('processRegister should handle non-rollback errors', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockImplementation(() => { throw new Error('dummy error') })

    await processRegister(register, false, devUser, {})
    expect(register.errors).toHaveLength(1)
    expect(register.errors[0]).toBe('dummy error')
  })

  test('should start a new transaction', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegisterInTransaction(register, false, devUser)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('should process register', async () => {
    const register = { errors: [], add: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegisterInTransaction(register, false, devUser, {})

    expect(register.errors).toEqual([])
    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('should perform rollback', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await expect(processRegisterInTransaction(register, true, devUser, {})).rejects.toThrow('Rolling back')
  })

  test('should handle error that isnt rollback', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockImplementation(() => { throw new Error('dummy error') })

    await expect(processRegisterInTransaction(register, true, devUser, {})).rejects.toThrow('dummy error')
  })
})
