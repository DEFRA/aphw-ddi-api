/* istanbul ignore file */
const { Sequelize } = require('sequelize')
const { DefaultAzureCredential } = require('@azure/identity')

const isProd = () => {
  return process.env.NODE_ENV === 'production'
}

const hooks = {
  beforeConnect: async (cfg) => {
    if (isProd()) {
      const credential = new DefaultAzureCredential()
      const accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net', { requestOptions: { timeout: 1000 } })
      cfg.password = accessToken.token
    }
  }
}

const retry = {
  backoffBase: 500,
  backoffExponent: 1.1,
  match: [/SequelizeConnectionError/],
  max: 10,
  name: 'connection',
  timeout: 60000
}

const dbConfig = {
  database: process.env.POSTGRES_DB,
  define: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  dialect: 'postgres',
  dialectOptions: {
    ssl: isProd()
  },
  hooks,
  host: process.env.POSTGRES_HOST,
  logging: process.env.POSTGRES_LOGGING || false,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  retry,
  schema: process.env.POSTGRES_SCHEMA_NAME,
  username: process.env.POSTGRES_USERNAME,
  pool: {
    max: 20,
    min: 5
  }
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig)

module.exports = sequelize
