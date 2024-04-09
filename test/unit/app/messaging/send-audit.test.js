const { isDataUnchanged, sendEventToAudit, sendCreateToAudit, sendActivityToAudit, sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')
const { importUser } = require('../../../../app/constants/import')

describe('SendAudit test', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('isDataUnchanged', () => {
    test('isDataUnchanged should handle null payload', () => {
      const res = isDataUnchanged(null)
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle added', () => {
      const res = isDataUnchanged('abcdef"added":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle removed', () => {
      const res = isDataUnchanged('abcdef"removed":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle edited', () => {
      const res = isDataUnchanged('abcdef"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return true when no data changed', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[]defghi')
      expect(res).toBe(true)
    })

    test('isDataUnchanged should return false when data added', () => {
      const res = isDataUnchanged('abcdef"added":[123],"removed":[],"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data removed', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[456],"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data edited', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[789]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data added and removed', () => {
      const res = isDataUnchanged('abcdef"added":[123],"removed":[456],"edited":[]defghi')
      expect(res).toBe(false)
    })
  })

  describe('sendEventToAudit', () => {
    test('should send event to audit', async () => {
      const hal3000 = { username: 'hal-9000', displayname: 'Hal 9000' }
      await sendEventToAudit('CREATE', 'DDI Create Something', 'created something', hal3000)
      expect(sendEvent).toBeCalledWith({
        type: 'CREATE',
        source: 'aphw-ddi-portal',
        id: expect.any(String),
        partitionKey: 'CREATE',
        subject: 'DDI Create Something',
        data: {
          message: JSON.stringify({
            actioningUser: hal3000,
            operation: 'created something'
          })
        }

      })
    })

    test('should fail given no user', async () => {
      await expect(sendEventToAudit('CREATE', 'DDI Create Something', 'created something', {})).rejects.toThrow('Username and displayname are required for auditing event of CREATE')
    })

    test('should not send an event given action is an import', async () => {
      await sendEventToAudit('CREATE', 'DDI Create Something', 'created something', importUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendCreateToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendCreateToAudit('SOMETHING', {}, {})).rejects.toThrow('Username and displayname are required for auditing creation of SOMETHING')
    })
    test('should not send an event given action is an import', async () => {
      await sendCreateToAudit('SOMETHING', {}, importUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendActivityToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendActivityToAudit({
        activityLabel: 'LABEL',
        pk: 'l100'
      }, {})).rejects.toThrow('Username and displayname are required for auditing activity of LABEL on l100')
    })
    test('should not send an event given action is an import', async () => {
      await sendActivityToAudit({}, importUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendUpdateToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendUpdateToAudit('OBJECT', {}, {}, {})).rejects.toThrow('Username and displayname are required for auditing update of OBJECT')
    })
    test('should not send an event given action is an import', async () => {
      await sendUpdateToAudit('OBJECT', {}, {}, importUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })
})
