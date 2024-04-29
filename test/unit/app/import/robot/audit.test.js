const { generateAuditEvents } = require('../../../../../app/import/robot/audit')
const { devUser } = require('../../../../mocks/auth')

jest.mock('../../../../../app/messaging/send-audit')
const { sendImportToAudit } = require('../../../../../app/messaging/send-audit')

describe('Audit tests', () => {
  test('should generate audit per row', async () => {
    const register = {
      add: [
        {},
        {},
        {}
      ]
    }

    await generateAuditEvents(register, devUser)

    expect(sendImportToAudit).toHaveBeenCalledTimes(3)
  })
})
