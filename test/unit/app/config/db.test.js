describe('db config', () => {
  const OLD_ENV = process.env

  require('@azure/identity')
  jest.mock('@azure/identity', () => {
    return {
      DefaultAzureCredential: jest.fn().mockImplementation(() => {
        return { getToken: () => { return { token: 'tok123' } } }
      })
    }
  })

  const mockSequelizeCall = jest.fn()
  require('sequelize')
  jest.mock('sequelize', () => {
    return {
      Sequelize: jest.fn().mockImplementation((database, username, password, config) => {
        config.hooks.beforeConnect(config)
        return mockSequelizeCall(database, username, password, config)
      })
    }
  })

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    jest.resetAllMocks() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('should call Sequelize with correct config', () => {
    process.env.POSTGRES_DB = 'myDB'
    process.env.POSTGRES_USERNAME = 'username'
    process.env.POSTGRES_PASSWORD = 'password'
    process.env.NODE_ENV = 'production'
    require('../../../../app/config/db')
    expect(mockSequelizeCall).toHaveBeenCalledWith('myDB', 'username', 'password', {
      database: 'myDB',
      define: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      },
      dialect: 'postgres',
      dialectOptions: {
        ssl: true
      },
      hooks: {
        beforeConnect: expect.anything()
      },
      host: undefined,
      logging: false,
      password: 'password',
      pool: {
        max: 20,
        min: 5
      },
      port: undefined,
      retry: {
        backoffBase: 500,
        backoffExponent: 1.1,
        match: [
          /SequelizeConnectionError/
        ],
        max: 10,
        name: 'connection',
        timeout: 60000
      },
      schema: undefined,
      username: 'username'
    })
  })
})
