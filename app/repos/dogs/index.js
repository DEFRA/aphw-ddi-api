const { updateMicrochips } = require('../microchip')

const {
  getBreeds,
  getStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateStatus,
  deleteDogByIndexNumber,
  switchOwnerIfNecessary,
  buildSwitchedOwner,
  getOldDogs,
  constructStatusList,
  constructDbSort,
  generateClausesForOr,
  customSort
} = require('./dog')

const {
  deleteDogs
} = require('./dogs')

module.exports = {
  getBreeds,
  getStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateMicrochips,
  updateStatus,
  deleteDogByIndexNumber,
  switchOwnerIfNecessary,
  buildSwitchedOwner,
  getOldDogs,
  constructStatusList,
  constructDbSort,
  generateClausesForOr,
  customSort,
  deleteDogs
}
