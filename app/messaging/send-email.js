const { createMessageSender } = require('./create-message-sender')
const { notificationsTopic } = require('../config/message')
const { createMessage } = require('./create-message')
const { validateEmail } = require('./validate-email')

const sendEmail = async (data) => {
  if (validateEmail(data)) {
    const message = createMessage(data)
    const eventSender = createMessageSender(notificationsTopic)
    await eventSender.sendMessage(message)
  } else {
    throw new Error(`Invalid email: unable to send ${data}`)
  }
}

module.exports = {
  sendEmail
}
