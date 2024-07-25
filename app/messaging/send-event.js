const { createMessageSender } = require('./create-message-sender')
const { eventsTopic } = require('../config/message')
const { createMessage } = require('./create-message')
const { validateEvent } = require('./validate-event')

const sendEvent = async (data) => {
  if (validateEvent(data)) {
    const message = createMessage(data)
    const eventSender = createMessageSender(eventsTopic)
    await eventSender.sendMessage(message)
  } else {
    throw new Error(`Invalid event: unable to send ${data}`)
  }
}

module.exports = {
  sendEvent
}
