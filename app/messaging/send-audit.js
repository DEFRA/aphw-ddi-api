const { v4: uuidv4 } = require('uuid')
const { CREATE, UPDATE, DELETE, ACTIVITY, IMPORT_MANUAL } = require('../constants/event/events')
const { SOURCE } = require('../constants/event/source')
const { getDiff } = require('json-difference')
const { sendEvent } = require('./send-event')
const { deepClone } = require('../lib/deep-clone')
const { isUserValid } = require('../auth/get-user')
const { CDO, DOG, PERSON, EXEMPTION, COURT } = require('../constants/event/audit-event-object-types')
const { accessImportUser, robotImportUser } = require('../constants/import')

const sendEventToAudit = async (eventType, eventSubject, eventDescription, actioningUser) => {
  if (!isUserValid(actioningUser)) {
    throw new Error(`Username and displayname are required for auditing event of ${eventType}`)
  }

  if (isImporting(actioningUser)) {
    return
  }

  const event = {
    type: eventType,
    source: SOURCE,
    id: uuidv4(),
    partitionKey: eventType,
    subject: eventSubject,
    data: {
      message: JSON.stringify({
        actioningUser,
        operation: eventDescription
      })
    }
  }

  await sendEvent(event)
}

const sendCreateToAudit = async (auditObjectName, entity, user) => {
  if (!isUserValid(user)) {
    throw new Error(`Username and displayname are required for auditing creation of ${auditObjectName}`)
  }

  if (isImporting(user)) {
    return
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

const sendActivityToAudit = async (activity, actioningUser) => {
  if (!isUserValid(actioningUser)) {
    throw new Error(`Username and displayname are required for auditing activity of ${activity.activityLabel} on ${activity.pk}`)
  }

  if (isImporting(actioningUser)) {
    return
  }

  const event = {
    type: ACTIVITY,
    source: SOURCE,
    id: uuidv4(),
    partitionKey: activity.pk,
    subject: `DDI Activity ${activity.activityLabel}`,
    data: {
      message: JSON.stringify({
        actioningUser,
        activity,
        operation: 'activity'
      })
    }
  }

  await sendEvent(event)
}

const constructCreatePayload = (auditObjectName, entity, actioningUser) => {
  return JSON.stringify({
    actioningUser,
    operation: `created ${auditObjectName}`,
    created: entity
  })
}

const sendUpdateToAudit = async (auditObjectName, entityPre, entityPost, user) => {
  if (!isUserValid(user)) {
    throw new Error(`Username and displayname are required for auditing update of ${auditObjectName}`)
  }

  if (isImporting(user)) {
    return
  }

  const messagePayload = constructUpdatePayload(auditObjectName, entityPre, entityPost, user)

  if (!isDataUnchanged(messagePayload)) {
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
}

const sendDeleteToAudit = async (auditObjectName, entity, user) => {
  if (!isUserValid(user)) {
    throw new Error(`Username and displayname are required for auditing deletion of ${auditObjectName}`)
  }

  const messagePayload = constructDeletePayload(auditObjectName, entity, user)

  const event = {
    type: DELETE,
    source: SOURCE,
    id: uuidv4(),
    partitionKey: determineUpdatePk(auditObjectName, entity),
    subject: `DDI Delete ${auditObjectName}`,
    data: {
      message: messagePayload
    }
  }

  await sendEvent(event)
}

const constructDeletePayload = (auditObjectName, entity, actioningUser) => {
  return JSON.stringify({
    actioningUser,
    operation: `deleted ${auditObjectName}`,
    deleted: entity
  })
}

const determineCreatePk = (objName, entity) => {
  if (objName === CDO) {
    return entity.dog.index_number
  } else if (objName === DOG) {
    return entity.index_number
  } else if (objName === COURT) {
    return entity.id.toString()
  }
  throw new Error(`Invalid object for create audit: ${objName}`)
}

const determineUpdatePk = (objName, entity) => {
  if (objName === DOG) {
    return entity.index_number
  } else if (objName === PERSON) {
    return entity.personReference || entity.person_reference
  } else if (objName === EXEMPTION) {
    return entity.index_number
  } else if (objName === COURT) {
    return entity.id.toString()
  }
  throw new Error(`Invalid object for update audit: ${objName}`)
}

const constructUpdatePayload = (auditObjectName, entityPre, entityPost, actioningUser) => {
  return JSON.stringify({
    actioningUser,
    operation: `updated ${auditObjectName}`,
    changes: getDiff(deepClone(entityPre), deepClone(entityPost))
  })
}

const isDataUnchanged = payload => {
  return payload?.indexOf('"added":[]') > -1 &&
  payload?.indexOf('"removed":[]') > -1 &&
  payload?.indexOf('"edited":[]') > -1
}

const isImporting = user => {
  return user?.username === accessImportUser.username || user?.username === robotImportUser.username
}

const sendImportToAudit = async (row, actioningUser) => {
  if (!isUserValid(actioningUser)) {
    throw new Error('Username and displayname are required for auditing import of records')
  }

  for (const dog of row.dogs) {
    const messagePayload = JSON.stringify({
      actioningUser,
      operation: `imported index number ${dog.indexNumber}`,
      imported: row
    })

    const event = {
      type: IMPORT_MANUAL,
      source: SOURCE,
      id: uuidv4(),
      partitionKey: `ED${dog.indexNumber}`,
      subject: 'DDI Import Record',
      data: {
        message: messagePayload
      }
    }

    await sendEvent(event)
  }
}

module.exports = {
  sendCreateToAudit,
  sendUpdateToAudit,
  sendEventToAudit,
  sendActivityToAudit,
  sendDeleteToAudit,
  isDataUnchanged,
  determineCreatePk,
  determineUpdatePk,
  sendImportToAudit
}
