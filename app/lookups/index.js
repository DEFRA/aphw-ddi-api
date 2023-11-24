const getCountry = require('./country')
const getCounty = require('./county')
const getBreed = require('./dog-breed')
const getInsuranceCompany = require('./insurance-company')
const getPersonType = require('./person-type')
const getPoliceForce = require('./police-force')
const getDogStatus = require('./dog-status')
const getRegistrationStatus = require('./registration-status')
const getContactType = require('./contact-type')

module.exports = {
  getCounty,
  getCountry,
  getBreed,
  getInsuranceCompany,
  getPersonType,
  getPoliceForce,
  getDogStatus,
  getRegistrationStatus,
  getContactType
}
