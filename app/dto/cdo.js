const { getMicrochip } = require('./dto-helper')
const { mapDogBreachDaoToBreachDto } = require('../repos/mappers/dog')
const { personAddressMapper, personContactMapper } = require('./mappers/person')
const { getInactiveSubStatus } = require('../lib/status-helper')

const generateOrderSpecificData = (data) => {
  if (data.registration.exemption_order.exemption_order === '2023') {
    return {
      microchipDeadline: data.registration.microchip_deadline,
      neuteringDeadline: data.registration.neutering_deadline,
      typedByDlo: data.registration.typed_by_dlo,
      withdrawn: data.registration.withdrawn
    }
  } else if (data.registration.exemption_order.exemption_order === '2015') {
    if (data.dog_breed.breed === 'XL Bully') {
      return {
        microchipDeadline: data.registration.microchip_deadline,
        neuteringDeadline: data.registration.neutering_deadline
      }
    } else {
      return {
        microchipDeadline: data.registration.microchip_deadline
      }
    }
  }
}

const cdoCreateDto = (data) => ({
  owner: {
    firstName: data.owner.first_name,
    lastName: data.owner.last_name,
    birthDate: data.owner.birth_date,
    address: {
      addressLine1: data.owner.address.address_line_1,
      addressLine2: data.owner.address.address_line_2,
      town: data.owner.address.town,
      postcode: data.owner.address.postcode,
      country: data.owner.address.country.country
    },
    personReference: data.owner.person_reference
  },
  enforcementDetails: {
    policeForce: data.dogs[0].registration.police_force.name,
    court: data.dogs[0].registration.court.name,
    legislationOfficer: data.dogs[0].registration.legislation_officer
  },
  dogs: data.dogs.map(d => ({
    indexNumber: d.index_number,
    name: d.name,
    microchipNumber: d.microchipNumber,
    status: d.status?.status,
    breed: d.dog_breed.breed,
    cdoIssued: d.registration.cdo_issued,
    cdoExpiry: d.registration.cdo_expiry,
    interimExemption: d.registration.joined_exemption_scheme
  }))
})

/**
 * @typedef CdoDog
 * @property {number} id
 * @property {string} dogReference
 * @property {string} indexNumber
 * @property {string} name
 * @property {string} breed
 * @property {string} status
 * @property {string} subStatus
 * @property {string|Date} dateOfBirth
 * @property {string|Date} dateOfDeath
 * @property {string} tattoo
 * @property {string} colour
 * @property {string} sex
 * @property {string|Date} dateExported
 * @property {string|Date} dateStolen
 * @property {string|Date} dateUntraceable
 * @property {string} microchipNumber
 * @property {string} microchipNumber2
 * @property {string[]} breaches
 */
/**
 * @typedef CdoAddress
 * @property {number} id
 * @property {number} person_id
 * @property {number} address_id
 * @property {{
 *  id: number;
 *  address_line_1: string;
 *  address_line_2: string;
 *  town: string;
 *  postcode: string;
 *  county: string;
 *  country_id: number;
 *  country: {
 *    id: number;
 *    country: 'string'
 *  }
 * }} address
 */
/**
 * @typedef CdoDtoPerson
 * @property {number} id
 * @property {string} personReference
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} dateOfBirth: '2024-11-28'
 * @property {CdoAddress[]} addresses
 * @property {{
 *    id: 0,
 *    person_id: 0,
 *    contact_id: 0,
 *    contact: {
 *      id: 0,
 *      contact: 'string',
 *      contact_type_id: 0,
 *      contact_type: {
 *        id: 0,
 *        contact_type: 'string'
 *      }
 *    }
 * }[]} person_contacts
 * @property {string} organisationName
 */
/**
 * @typedef CdoDtoExemption
 * @property {'1991'|'2023'|'2015'} exemptionOrder
 * @property {string|Date} cdoIssued
 * @property {string|Date} cdoExpiry
 * @property {string} court
 * @property {string} policeForce
 * @property {string} legislationOfficer
 * @property {string|Date} certificateIssued
 * @property {string|Date} applicationFeePaid
 * @property {{
 *   company: string;
 *   insuranceRenewal: string;
 * }[]} insurance
 * @property {string|Date} neuteringConfirmation
 * @property {string|Date} microchipVerification
 * @property {string|Date} joinedExemptionScheme
 * @property {string|Date} nonComplianceLetterSent
 */
/**
 * @typedef CdoDto
 * @property {CdoDtoPerson} person
 * @property {CdoDog} dog
 * @property {CdoDtoExemption} exemption
 */

/**
 * @param data
 * @return {CdoDto}
 */
const cdoViewDto = (data) => {
  const person = data.registered_person[0].person

  return {
    person: {
      id: person.id,
      personReference: person.person_reference,
      firstName: person.first_name,
      lastName: person.last_name,
      dateOfBirth: person.birth_date,
      addresses: person.addresses.map(personAddressMapper),
      person_contacts: person.person_contacts.map(personContactMapper),
      organisationName: person.organisation?.organisation_name ?? null
    },
    dog: {
      id: data.id,
      dogReference: data.dog_reference,
      indexNumber: data.index_number,
      name: data.name,
      breed: data.dog_breed.breed,
      status: data.status.status,
      subStatus: getInactiveSubStatus(data),
      dateOfBirth: data.birth_date,
      dateOfDeath: data.death_date,
      tattoo: data.tattoo,
      colour: data.colour,
      sex: data.sex,
      dateExported: data.exported_date,
      dateStolen: data.stolen_date,
      dateUntraceable: data.untraceable_date,
      microchipNumber: getMicrochip(data, 1),
      microchipNumber2: getMicrochip(data, 2),
      breaches: data.dog_breaches.map(mapDogBreachDaoToBreachDto),
      insurance_spotcheck_date: data.insurance_spotcheck_date
    },
    exemption: {
      exemptionOrder: data.registration.exemption_order.exemption_order,
      cdoIssued: data.registration.cdo_issued,
      cdoExpiry: data.registration.cdo_expiry,
      court: data.registration.court?.name,
      policeForce: data.registration?.police_force?.name,
      legislationOfficer: data.registration.legislation_officer,
      certificateIssued: data.registration.certificate_issued,
      applicationFeePaid: data.registration.application_fee_paid,
      insurance: data.insurance?.sort((a, b) => a.id - b.id).map(i => ({
        company: i.company.company_name,
        insuranceRenewal: i.renewal_date
      })),
      neuteringConfirmation: data.registration.neutering_confirmation,
      microchipVerification: data.registration.microchip_verification,
      joinedExemptionScheme: data.registration.joined_exemption_scheme,
      nonComplianceLetterSent: data.registration.non_compliance_letter_sent,
      ...generateOrderSpecificData(data)
    }
  }
}

module.exports = {
  cdoCreateDto,
  cdoViewDto,
  personContactMapper,
  generateOrderSpecificData
}
