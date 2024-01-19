const { v4: uuidv4 } = require('uuid')
const { CREATE, UPDATE } = require('../constants/event/events')
const { SOURCE } = require('../constants/event/source')
const { jsonDiff } = require('../lib/json-diff')
const { sendEvent } = require('./send-event')
const { CDO, DOG, PERSON, EXEMPTION } = require('../constants/event/audit-event-object-types')

const sendCreateToAudit = async (auditObjectName, entity, user) => {
  if (!user || user === '') {
    throw new Error(`Username is required for auditing creation of ${auditObjectName}`)
  }

  const messagePayload = constructCreatePayload(auditObjectName, entity, user)

  const event = {
    type: CREATE,
    source: SOURCE,
    id: uuidv4(),
    partitionKey: determineCreatePk(auditObjectName, entity),
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
    partitionKey: determineUpdatePk(auditObjectName, entityPre),
    subject: `DDI Update ${auditObjectName}`,
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const determineCreatePk = (objName, entity) => {
  if (objName === CDO) {
    return entity.dogs?.length > 0 ? entity.dogs[0].index_number : null
  } else if (objName === DOG) {
    return entity.index_number
  }
  throw new Error(`Invalid object for create audit: ${objName}`)
}

const determineUpdatePk = (objName, entity) => {
  if (objName === DOG) {
    return entity.index_number
  } else if (objName === PERSON) {
    return entity.person_reference
  } else if (objName === EXEMPTION) {
    return entity.index_number
  }
  throw new Error(`Invalid object for update audit: ${objName}`)
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
