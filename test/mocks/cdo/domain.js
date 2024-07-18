const { buildPersonAddressDao } = require('./get')
const { Cdo, Person, Dog, Exemption, CdoTask } = require('../../../app/data/domain')
const { BreachCategory } = require('../../../app/data/domain')

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
    buildPersonAddressDao()
  ],
  person_contacts: [],
  organisationName: null,
  ...cdoPersonPartial
})
/**
 * @typedef {{
 *  dateExported: null|Date,
 *  dateStolen: null|Date,
 *  microchipNumber: string|null,
 *  dateOfDeath: null|Date,
 *  sex: string|null,
 *  dogReference: string,
 *  dateOfBirth: string|null,
 *  indexNumber: string,
 *  breed: string,
 *  microchipNumber2: string|null,
 *  tattoo: string|null,
 *  colour: string|null,
 *  name: string|null,
 *  id: number,
 *  dateUntraceable: null|Date,
 *  status: string,
 *  dogBreaches: BreachCategory[]
 * }} CdoDogParams
 */
/**
 *
 * @param {Partial<CdoDogParams>}  cdoDogPartial
 * @return {CdoDogParams}
 */
const buildCdoDog = (cdoDogPartial = {}) => ({
  id: 300097,
  dogReference: '5270aad5-77d1-47ce-b41d-99a6e8f6e5fe',
  indexNumber: 'ED300097',
  name: 'Rex300',
  breed: 'XL Bully',
  status: 'Interim exempt',
  dateOfBirth: null,
  dateOfDeath: null,
  tattoo: null,
  colour: null,
  sex: null,
  dateExported: null,
  dateStolen: null,
  dateUntraceable: null,
  microchipNumber: null,
  microchipNumber2: null,
  dogBreaches: [],
  ...cdoDogPartial
})

/**
 * @typedef {{company: string, renewalDate: Date}} CdoInsurance
 */
/**
 *
 * @param {CdoInsurance} insurancePartial
 * @return {CdoInsurance}
 */
const buildCdoInsurance = (insurancePartial = {}) => ({
  company: 'Allianz',
  renewalDate: new Date('2024-01-01T00:00:00.000Z'),
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
 * @property {Date|null} applicationPackSent - Date application pack was sent
 * @property {Date|null} form2Sent - Date Form Two was sent
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
  insurance: [],
  neuteringConfirmation: null,
  microchipVerification: null,
  joinedExemptionScheme: new Date('2023-12-10'),
  nonComplianceLetterSent: null,
  applicationPackSent: null,
  form2Sent: null,
  ...exemptionPartial
})

/**
 * @param {{ person?: Partial<CdoPerson>; dog?: Partial<CdoDogParams>; exemption?: Partial<Exemption>;  }} cdoPartial
 * @return {Cdo}
 */
const buildCdo = (cdoPartial = {}) => {
  const personProps = buildCdoPerson(cdoPartial.person ?? {})
  const exemptionProps = buildExemption(cdoPartial.exemption ?? {})
  const dogProps = buildCdoDog(cdoPartial.dog ?? {})
  const person = new Person(personProps)
  const dog = new Dog(dogProps)
  const exemption = new Exemption(exemptionProps)
  return new Cdo(person, dog, exemption)
}

const buildTask = (cdoTask = {}) => {
  return new CdoTask(
    cdoTask.key ?? 'applicationPackSent',
    {
      available: cdoTask.available,
      completed: cdoTask.completed,
      readonly: cdoTask.readonly
    },
    cdoTask.timestamp
  )
}
const NOT_COVERED_BY_INSURANCE = new BreachCategory({
  id: 1,
  label: 'dog not covered by third party insurance',
  short_name: 'NOT_COVERED_BY_INSURANCE'
})
const NOT_ON_LEAD_OR_MUZZLED = new BreachCategory({
  id: 2,
  label: 'dog not kept on lead or muzzled',
  short_name: 'NOT_ON_LEAD_OR_MUZZLED'
})
const INSECURE_PLACE = new BreachCategory({
  id: 3,
  label: 'dog kept in insecure place',
  short_name: 'INSECURE_PLACE'
})
const AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR = new BreachCategory({
  id: 4,
  label: 'dog away from registered address for over 30 days in one year',
  short_name: 'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR'
})
const EXEMPTION_NOT_PROVIDED_TO_POLICE = new BreachCategory({
  id: 5,
  label: 'exemption certificate not provided to police',
  short_name: 'EXEMPTION_NOT_PROVIDED_TO_POLICE'
})
const INSURANCE_NOT_PROVIDED_TO_POLICE = new BreachCategory({
  id: 6,
  label: 'insurance evidence not provided to police',
  short_name: 'INSURANCE_NOT_PROVIDED_TO_POLICE'
})
const POLICE_PREVENTED_FROM_READING_MICROCHIP = new BreachCategory({
  id: 7,
  label: 'owner not allowed police to read microchip',
  short_name: 'POLICE_PREVENTED_FROM_READING_MICROCHIP'
})
const CHANGE_OF_REGISTERED_ADDRESS_NOT_PROVIDED = new BreachCategory({
  id: 8,
  label: 'change of registered address not provided to Defra',
  short_name: 'CHANGE_OF_REGISTERED_ADDRESS_NOT_PROVIDED'
})
const DOG_DEATH_NOT_REPORTED = new BreachCategory({
  id: 9,
  label: 'death of dog not reported to Defra',
  short_name: 'DOG_DEATH_NOT_REPORTED'
})
const DOG_EXPORT_NOT_REPORTED = new BreachCategory({
  id: 10,
  label: 'dog’s export not reported to Defra',
  short_name: 'DOG_EXPORT_NOT_REPORTED'
})

const allBreaches = [
  NOT_COVERED_BY_INSURANCE,
  NOT_ON_LEAD_OR_MUZZLED,
  INSECURE_PLACE,
  AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR,
  EXEMPTION_NOT_PROVIDED_TO_POLICE,
  INSURANCE_NOT_PROVIDED_TO_POLICE,
  POLICE_PREVENTED_FROM_READING_MICROCHIP,
  CHANGE_OF_REGISTERED_ADDRESS_NOT_PROVIDED,
  DOG_DEATH_NOT_REPORTED,
  DOG_EXPORT_NOT_REPORTED
]

module.exports = {
  buildCdoPerson,
  buildCdoDog,
  buildCdoInsurance,
  buildExemption,
  buildCdo,
  buildTask,
  allBreaches,
  NOT_COVERED_BY_INSURANCE,
  NOT_ON_LEAD_OR_MUZZLED,
  INSECURE_PLACE,
  AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR,
  EXEMPTION_NOT_PROVIDED_TO_POLICE,
  INSURANCE_NOT_PROVIDED_TO_POLICE,
  POLICE_PREVENTED_FROM_READING_MICROCHIP,
  CHANGE_OF_REGISTERED_ADDRESS_NOT_PROVIDED,
  DOG_DEATH_NOT_REPORTED,
  DOG_EXPORT_NOT_REPORTED
}
