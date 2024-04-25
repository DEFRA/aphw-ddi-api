describe('Processor wrapper tests', () => {
  jest.mock('../../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  jest.mock('../../../../../app/import/robot/processor')
  const { processRegisterRows, populatePoliceForce } = require('../../../../../app/import/robot/processor')

  const sequelize = require('../../../../../app/config/db')

  const { processRegister, processRegisterInTransaction } = require('../../../../../app/import/robot/processor-wrapper')

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test('processRegister should call processRegisterInTransaction', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegister(register, false)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('should start a new transaction', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegisterInTransaction(register, false)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('should process register', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegisterInTransaction(register, false, {})

    expect(register.errors).toEqual([])
    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('should perform rollback', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await expect(processRegisterInTransaction(register, true, {})).rejects.toThrow('Rolling back')
  })

  test('should handle error that isnt rollback', async () => {
    const register = { errors: [] }
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockImplementation(() => { throw new Error('dummy error') })

    await expect(processRegisterInTransaction(register, true, {})).rejects.toThrow('dummy error')
  })
})
