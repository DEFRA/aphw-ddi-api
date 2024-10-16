const { VIEW_DOG, VIEW_OWNER, SEARCH } = require('../../constants/event/events')
const { v4: uuidv4 } = require('uuid')
const { sendViewToAudit } = require('../../messaging/send-audit')

const determineViewAuditPk = (type, entity) => {
  try {
    if (type === VIEW_DOG) {
      return entity.index_number
    } else if (type === VIEW_OWNER) {
      return entity[0].person.person_reference
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
    details.dogIndexNumbers = entity.map(registeredPerson => registeredPerson.dog.index_number)
  }

  return details
}

const auditOwnerView = async (ownerEntity, user) => {
  if (user.origin !== 'aphw-ddi-portal') {
    const ownerDetails = constructViewDetails(VIEW_OWNER, ownerEntity)
    await sendViewToAudit(ownerDetails.pk, VIEW_OWNER, 'enforcement user viewed owner', ownerDetails, user)
  }
}

const auditDogView = async (dogEntity, user) => {
  if (user.origin !== 'aphw-ddi-portal') {
    const dogDetails = constructViewDetails(VIEW_DOG, dogEntity)
    await sendViewToAudit(dogDetails.pk, VIEW_DOG, 'enforcement user viewed dog', dogDetails, user)
  }
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
  auditOwnerView,
  auditDogView,
  auditSearch
}
