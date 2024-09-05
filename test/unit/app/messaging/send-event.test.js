jest.mock('../../../../app/messaging/create-message-sender')
const { createMessageSender } = require('../../../../app/messaging/create-message-sender')

const mockSendMessage = jest.fn()

describe('SendEvent test', () => {
  const { sendEvent } = require('../../../../app/messaging/send-event')

  beforeEach(() => {
    createMessageSender.mockImplementation(() => ({
      sendMessage: mockSendMessage
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('sendEvent', () => {
    test('should throw if invalid event', async () => {
      await expect(sendEvent(null)).rejects.toThrow('Invalid event: unable to send ')
    })

    test('should send if valid event', async () => {
      const validEvent = {
        type: 'type',
        source: 'source',
        id: 'id',
        subject: 'subject',
        partitionKey: 'pk1',
        data: { message: 'my message text' }
      }

      const expectedEvent = {
        body: {
          type: 'type',
          source: 'source',
          id: 'id',
          subject: 'subject',
          partitionKey: 'pk1',
          data: { message: 'my message text' },
          datacontenttype: 'text/json',
          specversion: '1.0',
          time: expect.anything()
        },
        type: 'type',
        source: 'source'
      }

      await sendEvent(validEvent)

      expect(mockSendMessage).toHaveBeenCalledWith(expectedEvent)
    })
  })
})
