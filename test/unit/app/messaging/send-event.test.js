
describe('SendEvent test', () => {
  const { sendEvent } = require('../../../../app/messaging/send-event')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('sendEvent', () => {
    test('should throw if invalid event', async () => {
      await expect(sendEvent(null)).rejects.toThrow('Invalid event: unable to send ')
    })
  })
})
