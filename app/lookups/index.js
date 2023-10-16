const getTitle = require('./title')
const getCountry = require('./country')
const getCounty = require('./county')
const getBreed = require('./dog-breed')
const getInsuranceCompany = require('./insurance-company')
const getMicrochipType = require('./microchip-type')
const getPersonType = require('./person-type')
const getPoliceForce = require('./police-force')
const getDogStatus = require('./dog-status')
const getRegistrationStatus = require('./registration-status')

module.exports = {
  getTitle,
  getCounty,
  getCountry,
  getBreed,
  getInsuranceCompany,
  getMicrochipType,
  getPersonType,
  getPoliceForce,
  getDogStatus,
  getRegistrationStatus
}
