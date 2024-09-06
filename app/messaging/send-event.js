const { createMessageSender } = require('./create-message-sender')
const { eventsTopic } = require('../config/message')
const { createEventMessage } = require('./create-message')
const { validateEvent } = require('./validate-event')

const sendEvent = async (data) => {
  if (validateEvent(data)) {
    const message = createEventMessage(data)
    const eventSender = createMessageSender(eventsTopic)
    await eventSender.sendMessage(message)
  } else {
    throw new Error(`Invalid event: unable to send ${data}`)
  }
}

module.exports = {
  sendEvent
}
