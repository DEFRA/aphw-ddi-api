describe('db config', () => {
  const OLD_ENV = process.env

  jest.mock('@azure/identity')
  const { DefaultAzureCredential } = require('@azure/identity')

  const mockSequelizeCall = jest.fn()
  require('sequelize')
  jest.mock('sequelize', () => {
    return {
      Sequelize: jest.fn().mockImplementation((config) => { return mockSequelizeCall(config) })
    }
  })

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    jest.resetAllMocks() // Most important - it clears the cache
    DefaultAzureCredential.mockResolvedValue({ getToken: { token: '123' } })
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('should call Sequelize with correct config', () => {
    process.env.POSTGRES_DB = 'myDB'
    require('../../../../app/config/db')
    expect(mockSequelizeCall).toHaveBeenCalledWith('myDB')
  })
})
