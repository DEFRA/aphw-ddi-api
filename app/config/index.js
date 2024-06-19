const Joi = require('joi')
const { getEnvironmentVariable } = require('../lib/environment-helpers')

// Define config schema
const schema = Joi.object({
  serviceName: Joi.string().default('Request Editor'),
  port: Joi.number().default(3001),
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  robotSheetName: Joi.string().required(),
  osPlacesApi: {
    baseUrl: Joi.string().default('https://api.os.uk/search/places/v1'),
    token: Joi.string().required()
  },
  policeApi: {
    baseUrl: Joi.string().default('https://data.police.uk/api')
  },
  overnightExportBatchSize: Joi.number(),
  paranoidRetentionPeriod: Joi.number()
})

// Build config
const config = {
  serviceName: process.env.SERVICE_NAME,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  robotSheetName: process.env.ROBOT_SHEET_NAME,
  osPlacesApi: {
    baseUrl: process.env.OS_PLACES_API_BASE_URL,
    token: getEnvironmentVariable('OS_PLACES_API_KEY')
  },
  policeApi: {
    baseUrl: process.env.POLICE_API_BASE_URL
  },
  overnightExportBatchSize: process.env.OVERNIGHT_EXPORT_BATCH_SIZE,
  paranoidRetentionPeriod: getEnvironmentVariable('PARANOID_RETENTION_PERIOD') ?? 90
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

module.exports = value
