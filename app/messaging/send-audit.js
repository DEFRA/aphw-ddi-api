const { v4: uuidv4 } = require('uuid')
const { CREATE, UPDATE } = require('../constants/event/events')
const { SOURCE } = require('../constants/event/source')
const { sendEvent } = require('./send-event')

const sendCreateToAudit = async (entity, user) => {
  const messagePayload = constructCreatePayload(entity, user)
  const event = {
    type: CREATE,
    source: SOURCE,
    id: uuidv4(),
    subject: 'Audit DDI - Create',
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const constructCreatePayload = (entity, user) => {
  return JSON.stringify({
    username: user,
    created: entity
  })
}

const sendUpdateToAudit = async (entityPre, entityPost, user) => {
  const messagePayload = constructUpdatePayload(entityPre, entityPost, user)
  const event = {
    type: UPDATE,
    source: SOURCE,
    id: uuidv4(),
    subject: 'Audit DDI - Update',
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const constructUpdatePayload = (entityPre, entityPost, user) => {
  return JSON.stringify({
    username: user,
    preUpdate: entityPre,
    postUpdate: entityPost
  })
}

module.exports = {
  sendCreateToAudit,
  sendUpdateToAudit
}
