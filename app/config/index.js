const Joi = require('joi')
const { getEnvironmentVariable } = require('../lib/environment-helpers')
const { DEVELOPMENT, TEST, PRODUCTION } = require('../constants/environments')
const cacheConfig = require('./cache')

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
  paranoidRetentionPeriod: Joi.number(),
  authServerUrl: Joi.string().required(),
  authTokens: Joi.object({
    portalKey: Joi.string().allow('').default(''),
    enforcementKey: Joi.string().allow('').default(''),
    apiKeyPublicKey: Joi.string().allow('').default(''),
    apiKeyPrivateKey: Joi.string().allow('').default('')
  }),
  userFeedbackEmailAddress: Joi.string().required(),
  enforcementUrl: Joi.string().required()
})

// Build config

const config = {
  serviceName: getEnvironmentVariable('SERVICE_NAME'),
  port: getEnvironmentVariable('PORT'),
  env: getEnvironmentVariable('NODE_ENV'),
  robotSheetName: getEnvironmentVariable('ROBOT_SHEET_NAME'),
  osPlacesApi: {
    baseUrl: getEnvironmentVariable('OS_PLACES_API_BASE_URL'),
    token: getEnvironmentVariable('OS_PLACES_API_KEY')
  },
  policeApi: {
    baseUrl: getEnvironmentVariable('POLICE_API_BASE_URL')
  },
  overnightExportBatchSize: getEnvironmentVariable('OVERNIGHT_EXPORT_BATCH_SIZE'),
  paranoidRetentionPeriod: getEnvironmentVariable('PARANOID_RETENTION_PERIOD') ?? 90,
  authServerUrl: getEnvironmentVariable('AUTH_SERVER_URL'),
  authTokens: {
    portalKey: getEnvironmentVariable('PORTAL_PUBLIC_KEY'),
    enforcementKey: getEnvironmentVariable('ENFORCEMENT_PUBLIC_KEY'),
    apiKeyPublicKey: getEnvironmentVariable('API_PUBLIC_KEY'),
    apiKeyPrivateKey: getEnvironmentVariable('API_PRIVATE_KEY')
  },
  userFeedbackEmailAddress: getEnvironmentVariable('USER_FEEDBACK_EMAIL_ADDRESS'),
  enforcementUrl: getEnvironmentVariable('ENFORCEMENT_URL')
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

value.isDev = value.env === DEVELOPMENT
value.isTest = value.env === TEST
value.isProd = value.env === PRODUCTION

value.cacheConfig = cacheConfig

/**
 *
 * @type {{
 *  isDev: boolean;
 *  isTest: boolean;
 *  isProd: boolean;
 *  cacheConfig: import('./cache.js');
 *  userFeedbackEmailAddress: string;
 *  authTokens: {apiKeyPublicKey: string, portalKey: string, enforcementKey: string, apiKeyPrivateKey: string};
 *  osPlacesApi: {baseUrl: string, token: string};
 *  port: string;
 *  robotSheetName: string;
 *  enforcementUrl: string;
 *  serviceName: string;
 *  env: string;
 *  overnightExportBatchSize: string;
 *  paranoidRetentionPeriod: (string|number);
 *  policeApi: {baseUrl: string};
 *  authServerUrl: string;
 * }}
 */
module.exports = value
