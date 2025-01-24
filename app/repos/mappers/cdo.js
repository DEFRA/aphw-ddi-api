/**
 * @typedef SummaryPersonDto
 * @property {number} id - e.g. 10,
 * @property {string} firstName - e.g. 'Scott',
 * @property {string} lastName - e.g. 'Pilgrim',
 * @property {string} personReference - e.g. 'P-1234-5678'
 */
/**
 * @typedef SummaryDogDto
 * @property {number} id - e.g. 300013,
 * @property {string} dogReference - e.g. 'ED300013',
 * @property {string} status - e.g. 'Pre-exempt'
 */
/**
 * @typedef SummaryExemptionDto
 * @property {string} policeForce - e.g. 'Cheshire Constabulary',
 * @property {string|null} cdoExpiry - e.g. '2024-03-01'
 * @property {string|null} joinedExemptionScheme - e.g. '2024-03-01'
 * @property {string|null} nonComplianceLetterSent - e.g. '2024-03-01'
 */
/**
 * @typedef SummaryCdoDto
 * @property {SummaryPersonDto} person
 * @property {SummaryDogDto} dog
 * @property {SummaryExemptionDto} exemption
 */
/**
 * @typedef SummaryTaskDto
 * @property {string} key
 * @property {boolean} insuranceDetailsRule
 * @property {boolean} applicationFeePaymentRule
 * @property {boolean} formTwoSentRule
 * @property {boolean} verificationDatesRecordedRule
 */

/**
 * @typedef SummaryCdoDtoWithTaskList
 * @property {SummaryPersonDto} person
 * @property {SummaryDogDto} dog
 * @property {SummaryExemptionDto} exemption
 * @protected {SummaryTaskDto[]} taskList
 */

const { Person, Cdo, Dog, Exemption, ContactDetails, Address } = require('../../data/domain')
const { getMicrochip } = require('../../dto/dto-helper')
const { mapDogBreachDaoToBreachCategory } = require('./dog')
const {
  ApplicationPackSentRule,
  ApplicationPackProcessedRule,
  InsuranceDetailsRule,
  ApplicationFeePaymentRule,
  FormTwoSentRule,
  VerificationDatesRecordedRule
} = require('../../data/domain/cdoTaskList/rules')
/**
 * @param {SummaryCdo} summaryCdo
 * @return {SummaryCdoDto}
 */
const mapSummaryCdoDaoToDto = (summaryCdo) => {
  const { registered_person: registeredPersons, registration } = summaryCdo
  const [registeredPerson] = registeredPersons
  const person = registeredPerson.person

  return {
    person: {
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      personReference: person.person_reference
    },
    dog: {
      id: summaryCdo.id,
      status: summaryCdo.status.status,
      dogReference: summaryCdo.index_number
    },
    exemption: {
      policeForce: registration.police_force?.name ?? null,
      cdoExpiry: registration.cdo_expiry,
      joinedExemptionScheme: registration.joined_exemption_scheme,
      nonComplianceLetterSent: registration.non_compliance_letter_sent
    }
  }
}

/**
 * @param {SummaryCdo} summaryCdo
 * @return {SummaryCdoDto}
 */
const mapSummaryCdoDaoToDtoWithTasks = (summaryCdo) => {
  const { registration } = summaryCdo

  const dogModel = mapDogDaoToDog(summaryCdo)
  const exemptionModel = mapCdoDaoToExemption(registration, summaryCdo.insurance)

  const applicationPackSentRule = new ApplicationPackSentRule(exemptionModel)
  const applicationPackProcessedRule = new ApplicationPackProcessedRule(exemptionModel, applicationPackSentRule)
  const insuranceDetailsRule = new InsuranceDetailsRule(exemptionModel, applicationPackSentRule)
  const applicationFeePaymentRule = new ApplicationFeePaymentRule(exemptionModel, applicationPackSentRule)
  const formTwoSentRule = new FormTwoSentRule(exemptionModel, applicationPackSentRule)
  const verificationDatesRecordedRule = new VerificationDatesRecordedRule(exemptionModel, dogModel, applicationPackSentRule, formTwoSentRule)

  const taskList = [
    applicationPackSentRule,
    applicationPackProcessedRule,
    insuranceDetailsRule,
    applicationFeePaymentRule,
    formTwoSentRule,
    verificationDatesRecordedRule
  ].map(({
    key,
    timestamp,
    completed,
    available,
    readonly
  }) => ({
    key,
    timestamp: timestamp?.toISOString(),
    completed,
    available,
    readonly
  }))

  return {
    ...mapSummaryCdoDaoToDto(summaryCdo),
    taskList
  }
}

/**
 * @param {PersonContactDao[]} personContactsDao
 * @param {PersonAddressDao[]} personAddresses
 * @return {ContactDetails}
 */
const mapPersonContactsToContactDetails = (personContactsDao, personAddresses = []) => {
  const [addressDao = { address: {} }] = personAddresses
  const {
    address_line_1: addressLine1,
    address_line_2: addressLine2,
    town,
    postcode
  } = addressDao.address

  const address = new Address({
    addressLine1,
    addressLine2,
    town,
    postcode
  })

  /**
   * @param {string|undefined} emailString
   * @param {PersonContactDao} contact
   * @return {string|undefined}
   */
  const reducer = (emailString, contact) => {
    if (contact.contact?.contact_type.contact_type === 'Email') {
      return contact.contact.contact
    }
    return emailString
  }

  /**
   * @type {string|undefined}
   */
  const email = personContactsDao.reduce(reducer, undefined)
  return new ContactDetails(email, address)
}

const mapCdoPersonToPerson = (person) => {
  const params = {
    id: person.id,
    personReference: person.person_reference,
    firstName: person.first_name,
    lastName: person.last_name,
    dateOfBirth: person.birth_date,
    addresses: person.addresses,
    person_contacts: person.person_contacts,
    organisationName: person.organisation?.organisation_name ?? null,
    contactDetails: mapPersonContactsToContactDetails(person.person_contacts, person.addresses)
  }

  return new Person(params)
}

const mapDogDaoToDog = (dogDao, includeRegistration = false) => {
  const dogProperties = {
    id: dogDao.id,
    dogReference: dogDao.dog_reference,
    indexNumber: dogDao.index_number,
    name: dogDao.name,
    breed: dogDao.dog_breed?.breed,
    status: dogDao.status?.status,
    dateOfBirth: returnDateOrNull(dogDao.birth_date),
    dateOfDeath: returnDateOrNull(dogDao.death_date),
    tattoo: dogDao.tattoo,
    colour: dogDao.colour,
    sex: dogDao.sex,
    dateExported: returnDateOrNull(dogDao.exported_date),
    dateStolen: returnDateOrNull(dogDao.stolen_date),
    dateUntraceable: returnDateOrNull(dogDao.untraceable_date),
    microchipNumber: getMicrochip(dogDao, 1),
    microchipNumber2: getMicrochip(dogDao, 2),
    dogBreaches: dogDao.dog_breaches?.map(mapDogBreachDaoToBreachCategory)
  }
  if (includeRegistration) {
    dogProperties.exemption = mapCdoDaoToExemption(dogDao.registration)
  }
  return new Dog(dogProperties)
}

const returnDateOrNull = (dateOrNull) => {
  if (dateOrNull === undefined) {
    return null
  }
  return dateOrNull === null ? null : new Date(dateOrNull)
}

const mapCdoDaoToExemption = (registration, insurance) => {
  const exemptionProperties = {
    exemptionOrder: registration.exemption_order.exemption_order,
    cdoIssued: new Date(registration.cdo_issued),
    cdoExpiry: new Date(registration.cdo_expiry),
    court: registration.court?.name,
    policeForce: registration?.police_force?.name,
    legislationOfficer: registration.legislation_officer,
    certificateIssued: returnDateOrNull(registration.certificate_issued),
    applicationFeePaid: returnDateOrNull(registration.application_fee_paid),
    insurance: insurance?.sort((a, b) => a.id - b.id).map(i => ({
      company: i.company.company_name,
      renewalDate: returnDateOrNull(i.renewal_date)
    })),
    neuteringConfirmation: returnDateOrNull(registration.neutering_confirmation),
    neuteringDeadline: returnDateOrNull(registration.neutering_deadline),
    microchipVerification: returnDateOrNull(registration.microchip_verification),
    microchipDeadline: returnDateOrNull(registration.microchip_deadline),
    joinedExemptionScheme: new Date(registration.joined_exemption_scheme),
    nonComplianceLetterSent: returnDateOrNull(registration.non_compliance_letter_sent),
    applicationPackSent: returnDateOrNull(registration.application_pack_sent),
    applicationPackProcessed: returnDateOrNull(registration.application_pack_processed),
    form2Sent: returnDateOrNull(registration.form_two_sent),
    form2Submitted: returnDateOrNull(registration.form_two?.form_two_submitted),
    insuranceDetailsRecorded: returnDateOrNull(registration.insurance_details_recorded),
    microchipNumberRecorded: returnDateOrNull(registration.microchip_number_recorded),
    applicationFeePaymentRecorded: returnDateOrNull(registration.application_fee_payment_recorded),
    verificationDatesRecorded: returnDateOrNull(registration.verification_dates_recorded),
    withdrawn: returnDateOrNull(registration.withdrawn)
  }
  return new Exemption(exemptionProperties)
}
const mapCdoDaoToCdo = (cdoDao) => {
  const person = mapCdoPersonToPerson(cdoDao.registered_person[0].person)
  const dog = mapDogDaoToDog(cdoDao)
  const exemption = mapCdoDaoToExemption(cdoDao.registration, cdoDao.insurance)

  return new Cdo(person, dog, exemption)
}
module.exports = {
  mapSummaryCdoDaoToDto,
  mapSummaryCdoDaoToDtoWithTasks,
  mapCdoPersonToPerson,
  mapCdoDaoToCdo,
  mapCdoDaoToExemption,
  mapDogDaoToDog,
  mapPersonContactsToContactDetails
}
