const { sendEvent } = require('../../../messaging/send-event')
const { SOURCE } = require('../../../constants/event/source')
const { IMPORT } = require('../../../constants/event/events')
const { v4: uuidv4 } = require('uuid')

const sendCommentEvent = async (commentModel) => {
  const dogIndexNumber = commentModel.registration.dog.index_number

  const { registration, ...comment } = commentModel.dataValues
  comment.dogIndexNumber = dogIndexNumber
  const event = {
    type: IMPORT,
    source: SOURCE,
    id: uuidv4(),
    subject: 'DDI Import Comment',
    partitionKey: dogIndexNumber,
    data: {
      message: JSON.stringify(comment)
    }
  }

  await sendEvent(event)
}

module.exports = {
  sendCommentEvent
}
