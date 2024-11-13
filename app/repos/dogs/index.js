const { updateMicrochips } = require('../microchip')

const {
  getBreeds,
  getStatuses,
  getCachedStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateBreaches,
  updateStatus,
  deleteDogByIndexNumber,
  switchOwnerIfNecessary,
  buildSwitchedOwner,
  getOldDogs,
  constructStatusList,
  constructDbSort,
  generateClausesForOr,
  customSort,
  purgeDogByIndexNumber,
  saveDog,
  saveDogFields,
  getDogModel,
  determineExemptionOrder
} = require('./dog')

const {
  deleteDogs
} = require('./dogs')

module.exports = {
  getBreeds,
  getStatuses,
  getCachedStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateMicrochips,
  updateBreaches,
  updateStatus,
  deleteDogByIndexNumber,
  switchOwnerIfNecessary,
  buildSwitchedOwner,
  getOldDogs,
  constructStatusList,
  constructDbSort,
  generateClausesForOr,
  customSort,
  deleteDogs,
  purgeDogByIndexNumber,
  saveDog,
  saveDogFields,
  getDogModel,
  determineExemptionOrder
}
