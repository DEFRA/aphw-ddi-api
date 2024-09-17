jest.mock('../../../../app/messaging/create-message-sender')
const { createMessageSender } = require('../../../../app/messaging/create-message-sender')

const mockSendMessage = jest.fn()

describe('SendEmail test', () => {
  const { sendEmail } = require('../../../../app/messaging/send-email')

  beforeEach(() => {
    createMessageSender.mockImplementation(() => ({
      sendMessage: mockSendMessage
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('sendEmail', () => {
    test('should throw if invalid email', async () => {
      await expect(sendEmail(null)).rejects.toThrow('Invalid email: unable to send ')
    })

    test('should send if valid email', async () => {
      const validEmail = {
        type: 'type',
        toAddress: 'target@email.com',
        customFields: [
          { name: 'field1', value: 'value1' }
        ]
      }

      const expectedEmail = {
        body: {
          id: expect.anything(),
          type: 'type',
          source: 'aphw-ddi-api',
          data: {
            emailAddress: 'target@email.com',
            personalisation: {
              personalisation: {
                field1: 'value1'
              }
            }
          },
          specversion: '1.0',
          time: expect.anything()
        },
        type: 'type',
        source: 'aphw-ddi-api'
      }

      await sendEmail(validEmail)

      expect(mockSendMessage).toHaveBeenCalledWith(expectedEmail)
    })
  })
})
