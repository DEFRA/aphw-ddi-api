const { processRegister } = require('../../../../../app/import/robot/processor-wrapper')

jest.mock('../../../../../app/import/robot/processor')
const { processRegisterRows, populatePoliceForce } = require('../../../../../app/import/robot/processor')

describe('Processor wrapper tests', () => {
  jest.mock('../../../../../app/config/db', () => ({
    transaction: jest.fn().mockImplementation((transactionCallback) => {
      return {}
    })
  }))

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should process register', async () => {
    processRegisterRows.mockResolvedValue()
    populatePoliceForce.mockResolvedValue()

    await processRegister({ errors: [] }, [])
  })
})
