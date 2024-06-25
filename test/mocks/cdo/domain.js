const { buildPersonAddress, cdo } = require('./get')

/**
 * @param {Partial<CdoPerson>} cdoPersonPartial
 * @return {CdoPerson}
 */
const buildCdoPerson = (cdoPersonPartial = {}) => ({
  id: 90,
  personReference: 'P-8AD0-561A',
  firstName: 'Alex',
  lastName: 'Carter',
  dateOfBirth: new Date('1998-05-10'),
  addresses: [
    buildPersonAddress()
  ],
  person_contacts: [],
  organisationName: null,
  ...cdoPersonPartial
})

/**
 *
 * @param cdoDogPartial
 * @return {*&{dateExported: null, dateStolen: null, microchipNumber: string, dateOfDeath: null, sex: string, dogReference: string, dateOfBirth: string, indexNumber: string, breed: string, microchipNumber2: null, tattoo: string, colour: string, name: string, id: number, dateUntraceable: null, status: string}}
 */
const buildCdoDog = (cdoDogPartial) => ({
  id: 300097,
  dogReference: '5270aad5-77d1-47ce-b41d-99a6e8f6e5fe',
  indexNumber: 'ED300097',
  name: 'Rex300',
  breed: 'XL Bully',
  status: 'Interim exempt',
  dateOfBirth: '1999-01-01',
  dateOfDeath: null,
  tattoo: '',
  colour: '',
  sex: '',
  dateExported: null,
  dateStolen: null,
  dateUntraceable: null,
  microchipNumber: '123456789012345',
  microchipNumber2: null,
  ...cdoDogPartial
})

/**
 * @typedef {{company: string, insuranceRenewal: string}} CdoInsurance
 */
/**
 *
 * @param {CdoInsurance} insurancePartial
 * @return {CdoInsurance}
 */
const buildCdoInsurance = (insurancePartial = {}) => ({
  company: 'Allianz',
  insuranceRenewal: '2024-01-01T00:00:00.000Z',
  ...insurancePartial
})
/**
 * @typedef {Object} Exemption
 * @property {string} exemptionOrder - Exemption order details.
 * @property {Date} cdoIssued - Date when the CDO was issued.
 * @property {Date} cdoExpiry - Expiry date of the CDO.
 * @property {CdoInsurance[]} insurance - Array of insurance details.
 * @property {Date|null} microchipVerification - Microchip verification status, currently null.
 * @property {Date|null} neuteringConfirmation - Neutering confirmation status, currently null.
 * @property {string} court - Name of the court.
 * @property {Date|null} nonComplianceLetterSent - Status of non-compliance letter sent, currently null.
 * @property {Date|null} certificateIssued - Status of certificate issued, currently null.
 * @property {string} legislationOfficer - Name of the legislation officer.
 * @property {Date} joinedExemptionScheme - Date when joined the exemption scheme.
 * @property {string} policeForce - Name of the police force.
 * @property {Date|null} applicationFeePaid - Status of application fee payment, currently null.
 */

/**
 * @param {Partial<Exemption>} exemptionPartial
 * @return {Exemption}
 */
const buildExemption = (exemptionPartial = {}) => ({
  exemptionOrder: '2015',
  cdoIssued: new Date('2023-10-10'),
  cdoExpiry: new Date('2023-12-10'),
  court: 'Aberystwyth Justice Centre',
  policeForce: 'Avon and Somerset Constabulary',
  legislationOfficer: 'Sidney Lewis',
  certificateIssued: null,
  applicationFeePaid: null,
  insurance: [
    buildCdoInsurance()
  ],
  neuteringConfirmation: null,
  microchipVerification: null,
  joinedExemptionScheme: new Date('2023-12-10'),
  nonComplianceLetterSent: null,
  ...exemptionPartial
})

const buildCdo = (cdoPartial) => ({
  person: buildCdoPerson(),
  dog: buildCdoDog(),
  exemption: buildExemption()
})

module.exports = {
  buildCdoPerson,
  buildCdoDog,
  buildCdoInsurance,
  buildExemption,
  buildCdo
}
