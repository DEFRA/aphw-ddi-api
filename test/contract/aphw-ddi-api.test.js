const config = require('../../app/config')
require('../../app/config/db')
const dbHelper = require('../db-helper')

describe('Pact Verification', () => {
  const { Verifier } = require('@pact-foundation/pact')

  let createServer
  let server

  beforeAll(async () => {
    createServer = require('../../app/server')
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
        'countries exist': async () => {
          // await dbHelper.truncate()
          // await dbHelper.createCountryRecords([
          //   { id: 1, country: 'England' },
          //   { id: 2, country: 'Scotland' },
          //   { id: 3, country: 'Wales' }
          // ])
          return 'Countries added to db'
        },
        'cdo includes optional data and country': () => true
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
