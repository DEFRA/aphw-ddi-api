describe('db config', () => {
  const OLD_ENV = process.env

  require('@azure/identity')
  jest.mock('@azure/identity', () => {
    return {
      DefaultAzureCredential: jest.fn().mockImplementation(() => {
        return { getToken: () => { return { token: 'tok123' } } }
      }),
      getBearerTokenProvider: jest.fn().mockImplementation(() => {
        return Promise.resolve('password')
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
    process.env.POSTGRES_HOST = 'aphw-ddi-api'
    process.env.POSTGRES_PORT = '5432'
    process.env.POSTGRES_SCHEMA_NAME = 'public'
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
      host: 'aphw-ddi-api',
      logging: false,
      password: Promise.resolve('password'),
      pool: {
        max: 20,
        min: 5
      },
      port: '5432',
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
      schema: 'public',
      username: 'username'
    })
  })
})
