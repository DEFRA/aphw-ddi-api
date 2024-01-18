const { v4: uuidv4 } = require('uuid')
const { CREATE, UPDATE } = require('../constants/event/events')
const { SOURCE } = require('../constants/event/source')
const { jsonDiff } = require('../lib/json-diff')
const { sendEvent } = require('./send-event')

const sendCreateToAudit = async (auditObjectName, entity, user) => {
  if (!user || user === '') {
    throw new Error(`Username is required for auditing creation of ${auditObjectName}`)
  }

  const messagePayload = constructCreatePayload(auditObjectName, entity, user)

  const event = {
    type: CREATE,
    source: SOURCE,
    id: uuidv4(),
    subject: `DDI Create ${auditObjectName}`,
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const constructCreatePayload = (auditObjectName, entity, user) => {
  return JSON.stringify({
    username: user,
    operation: `created ${auditObjectName}`,
    created: entity
  })
}

const sendUpdateToAudit = async (auditObjectName, entityPre, entityPost, user) => {
  if (!user || user === '') {
    throw new Error(`Username is required for auditing update of ${auditObjectName}`)
  }

  const messagePayload = constructUpdatePayload(auditObjectName, entityPre, entityPost, user)

  const event = {
    type: UPDATE,
    source: SOURCE,
    id: uuidv4(),
    subject: `DDI Update ${auditObjectName}`,
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const constructUpdatePayload = (auditObjectName, entityPre, entityPost, user) => {
  return JSON.stringify({
    username: user,
    operation: `updated ${auditObjectName}`,
    changes: jsonDiff(entityPre, entityPost)
  })
}

module.exports = {
  sendCreateToAudit,
  sendUpdateToAudit
}
