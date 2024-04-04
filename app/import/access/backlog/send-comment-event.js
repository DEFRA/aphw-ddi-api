const { sendEvent } = require('../../../messaging/send-event')
const { SOURCE } = require('../../../constants/event/source')
const { IMPORT } = require('../../../constants/event/events')
const { v4: uuidv4 } = require('uuid')
const { importUser } = require('../../../constants/import')

const createCommentAuditMessage = (commentModel, dogIndexNumber, actioningUser) => {
  const { registration, ...comment } = commentModel.dataValues

  return {
    actioningUser,
    operation: 'added comment',
    added: {
      id: comment.id,
      comment: comment.comment,
      registration_id: comment.registration_id,
      dog_index_number: dogIndexNumber,
      cdo_issued: registration.cdo_issued
    }
  }
}

const sendCommentEvent = async (commentModel) => {
  const dogIndexNumber = commentModel.registration.dog.index_number
  const event = {
    type: IMPORT,
    source: SOURCE,
    id: uuidv4(),
    subject: 'DDI Import Comment',
    partitionKey: dogIndexNumber,
    data: {
      message: JSON.stringify(createCommentAuditMessage(commentModel, dogIndexNumber, importUser))
    }
  }

  await sendEvent(event)
}

module.exports = {
  createCommentAuditMessage,
  sendCommentEvent
}
