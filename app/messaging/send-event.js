const { MessageSender } = require('ffc-messaging')
const { eventsTopic } = require('../config/message')
const { createMessage } = require('./create-message')
const { validateEvent } = require('./validate-event')

const sendEvent = async (data) => {
  if (validateEvent(data)) {
    const message = createMessage(data)
    const eventSender = new MessageSender(eventsTopic)
    await eventSender.sendMessage(message)
    await eventSender.closeConnection()
  } else {
    throw new Error(`Invalid event: unable to send ${data}`)
  }
}

module.exports = {
  sendEvent
}
