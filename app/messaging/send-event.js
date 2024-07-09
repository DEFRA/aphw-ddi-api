const { createMessageSender } = require('./create-message-sender')
const { eventsTopic, certificateQueue } = require('../config/message')
const { createMessage, createCertificateMessage } = require('./create-message')
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

const sendDocumentMessage = async (certificateId, cdoTaskList, user) => {
  const message = createCertificateMessage(certificateId, cdoTaskList, user)
  const eventSender = createMessageSender(certificateQueue)
  await eventSender.sendMessage(message)
}

module.exports = {
  sendEvent,
  sendDocumentMessage
}
