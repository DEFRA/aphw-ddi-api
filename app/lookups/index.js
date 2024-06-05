const getCountry = require('./country')
const getCounty = require('./county')
const getBreed = require('./dog-breed')
const getInsuranceCompany = require('./insurance-company')
const getPersonType = require('./person-type')
const getPoliceForce = require('./police-force')
const getContactType = require('./contact-type')
const getCourt = require('./court')
const getExemptionOrder = require('./exemption-order')

module.exports = {
  getCounty,
  getCountry,
  getBreed,
  getInsuranceCompany,
  getPersonType,
  getPoliceForce,
  getContactType,
  getCourt,
  getExemptionOrder
}
