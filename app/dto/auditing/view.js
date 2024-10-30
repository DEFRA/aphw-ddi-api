const { VIEW_DOG, VIEW_OWNER, SEARCH, VIEW_OWNER_ACTIVITY, VIEW_DOG_ACTIVITY } = require('../../constants/event/events')
const { v4: uuidv4 } = require('uuid')
const { sendViewToAudit } = require('../../messaging/send-audit')

const determineViewAuditPk = (type, entity) => {
  try {
    if (type === VIEW_DOG || type === VIEW_DOG_ACTIVITY) {
      return entity.index_number
    } else if (type === VIEW_OWNER) {
      return entity[0].person.person_reference
    } else if (type === VIEW_OWNER_ACTIVITY) {
      return entity.person_reference
    } else if (type === SEARCH) {
      return uuidv4()
    }
  } catch (e) {
    console.error(`Missing parameter for view audit: ${type}`)
  }
  throw new Error(`Invalid object for view audit: ${type}`)
}

/**
 *
 * @param type
 * @param {string|DogDao|RegisteredPersonDao[]} entity
 * @return {{pk: (*|`${string}-${string}-${string}-${string}-${string}`|string|string)}}
 */
const constructViewDetails = (type, entity) => {
  const details = {
    pk: determineViewAuditPk(type, entity)
  }

  if (type === SEARCH) {
    details.searchTerms = entity
  } else if (type === VIEW_OWNER && Array.isArray(entity)) {
    details.dogIndexNumbers = entity.map(registeredPerson => registeredPerson.dog?.index_number)
  }

  return details
}

const auditOwnerView = async (ownerEntity, user, type, subject) => {
  if (user.origin !== 'aphw-ddi-portal') {
    const ownerDetails = constructViewDetails(type, ownerEntity)
    await sendViewToAudit(ownerDetails.pk, type, subject, ownerDetails, user)
  }
}

const auditOwnerDetailsView = async (ownerEntity, user) => {
  await auditOwnerView(ownerEntity, user, VIEW_OWNER, 'enforcement user viewed owner details')
}
const auditOwnerActivityView = async (ownerEntity, user) => {
  await auditOwnerView(ownerEntity, user, VIEW_OWNER_ACTIVITY, 'enforcement user viewed owner activity')
}

const auditDogView = async (dogEntity, user, type, subject) => {
  if (user.origin !== 'aphw-ddi-portal') {
    const dogDetails = constructViewDetails(type, dogEntity)
    await sendViewToAudit(dogDetails.pk, type, subject, dogDetails, user)
  }
}

const auditDogDetailsView = async (dogEntity, user) => {
  await auditDogView(dogEntity, user, VIEW_DOG, 'enforcement user viewed dog details')
}
const auditDogActivityView = async (dogEntity, user) => {
  await auditDogView(dogEntity, user, VIEW_DOG_ACTIVITY, 'enforcement user viewed dog activity')
}

const auditSearch = async (searchTerm, user) => {
  if (user.origin !== 'aphw-ddi-portal') {
    const searchDetails = constructViewDetails(SEARCH, searchTerm)
    await sendViewToAudit(searchDetails.pk, SEARCH, 'enforcement user performed search', searchDetails, user)
  }
}

module.exports = {
  determineViewAuditPk,
  constructViewDetails,
  auditOwnerDetailsView,
  auditOwnerActivityView,
  auditDogDetailsView,
  auditDogActivityView,
  auditSearch
}
