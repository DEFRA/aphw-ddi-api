const config = require('../../app/config')
require('../../app/config/db')
const dbHelper = require('../db-helper')

describe('Pact Verification', () => {
  const { Verifier } = require('@pact-foundation/pact')

  let createServer
  let server

  beforeAll(async () => {
    createServer = require('../../app/server')
    await dbHelper.truncateDatabase()
    await dbHelper.addPerson()
    await dbHelper.createCdoWithDog()
  })

  beforeEach(async () => {
    server = await createServer()
    await server.start()
  })

  test('validates the expectations of aphw-ddi-api', async () => {
    const opts = {
      providerBaseUrl: `http://localhost:${config.port}`,
      provider: 'aphw-ddi-api',
      consumerVersionTags: ['main', 'dev', 'test', 'preprod', 'prod'],
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD,
      stateHandlers: {
        // 'countries exist': async () => true,
        // 'cdo includes optional data and country': () => true,
        // 'owner already exists in the db': async () => true
        // 'aphw-ddi-api has a matching dog Bruno ED300006': async () => true
      }
    }

    await new Verifier(opts).verifyProvider()
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    await dbHelper.close()
  })
})
