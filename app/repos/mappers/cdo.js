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

const { Person, Cdo, Dog, Exemption } = require('../../data/domain')
const { getMicrochip } = require('../../dto/dto-helper')
const { mapDogBreachDaoToBreachCategory } = require('./dog')
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

const mapCdoPersonToPerson = (person) => {
  const params = {
    id: person.id,
    personReference: person.person_reference,
    firstName: person.first_name,
    lastName: person.last_name,
    dateOfBirth: person.birth_date,
    addresses: person.addresses,
    person_contacts: person.person_contacts,
    organisationName: person.organisation?.organisation_name ?? null
  }

  return new Person(params)
}

const mapDogDaoToDog = (dogDao) => {
  const dogProperties = {
    id: dogDao.id,
    dogReference: dogDao.dog_reference,
    indexNumber: dogDao.index_number,
    name: dogDao.name,
    breed: dogDao.dog_breed?.breed,
    status: dogDao.status?.status,
    dateOfBirth: dogDao.birth_date,
    dateOfDeath: dogDao.death_date,
    tattoo: dogDao.tattoo,
    colour: dogDao.colour,
    sex: dogDao.sex,
    dateExported: dogDao.exported_date,
    dateStolen: dogDao.stolen_date,
    dateUntraceable: dogDao.untraceable_date,
    microchipNumber: getMicrochip(dogDao, 1),
    microchipNumber2: getMicrochip(dogDao, 2),
    dogBreaches: dogDao.dog_breaches.map(mapDogBreachDaoToBreachCategory)
  }
  return new Dog(dogProperties)
}

const returnDateOrNull = (dateOrNull) => {
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
    microchipVerification: returnDateOrNull(registration.microchip_verification),
    joinedExemptionScheme: new Date(registration.joined_exemption_scheme),
    nonComplianceLetterSent: returnDateOrNull(registration.non_compliance_letter_sent),
    applicationPackSent: returnDateOrNull(registration.application_pack_sent),
    form2Sent: returnDateOrNull(registration.form_two_sent),
    insuranceDetailsRecorded: returnDateOrNull(registration.insurance_details_recorded),
    microchipNumberRecorded: returnDateOrNull(registration.microchip_number_recorded),
    applicationFeePaymentRecorded: returnDateOrNull(registration.application_fee_payment_recorded),
    verificationDatesRecorded: returnDateOrNull(registration.verification_dates_recorded)
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
  mapCdoDaoToCdo,
  mapCdoDaoToExemption,
  mapDogDaoToDog
}
