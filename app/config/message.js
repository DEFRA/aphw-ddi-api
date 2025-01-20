const Joi = require('joi')
const { PRODUCTION } = require('../constants/environments')

const schema = Joi.object({
  messageQueue: {
    host: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object()
  },
  eventsTopic: {
    address: Joi.string()
  },
  notificationsTopic: {
    address: Joi.string()
  },
  managedIdentityClientId: Joi.string().optional()
})

const config = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === PRODUCTION,
    appInsights: process.env.NODE_ENV === PRODUCTION ? require('applicationinsights') : undefined
  },
  eventsTopic: {
    address: process.env.EVENTS_TOPIC_ADDRESS
  },
  notificationsTopic: {
    address: process.env.NOTIFICATIONS_TOPIC_ADDRESS
  },
  managedIdentityClientId: process.env.AZURE_CLIENT_ID
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The message config is invalid. ${result.error.message}`)
}

const eventsTopic = { ...result.value.messageQueue, ...result.value.eventsTopic }

const notificationsTopic = { ...result.value.messageQueue, ...result.value.notificationsTopic }

module.exports = {
  eventsTopic,
  notificationsTopic
}
