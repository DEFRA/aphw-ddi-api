describe('SendEvent test', () => {
  jest.mock('../../../../app/messaging/create-message-sender')
  const { createMessageSender } = require('../../../../app/messaging/create-message-sender')

  const { sendEvent } = require('../../../../app/messaging/send-event')

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should throw if invalid event', async () => {
    await expect(sendEvent(null)).rejects.toThrow('Invalid event: unable to send ')
  })

  test('should send event', async () => {
    const sendMessageMock = jest.fn()
    createMessageSender.mockReturnValue({ sendMessage: sendMessageMock })

    const data = {
      type: 'type',
      source: 'source',
      id: 'id',
      subject: 'subject',
      partitionKey: 'partitionKey',
      data: { message: 'messageContent' }
    }

    await sendEvent(data)

    expect(sendMessageMock).toHaveBeenCalledWith({
      body: {
        data: {
          message: 'messageContent'
        },
        datacontenttype: 'text/json',
        id: 'id',
        partitionKey: 'partitionKey',
        source: 'source',
        specversion: '1.0',
        subject: 'subject',
        time: expect.anything(),
        type: 'type'
      },
      source: 'source',
      type: 'type'
    })
  })
})
