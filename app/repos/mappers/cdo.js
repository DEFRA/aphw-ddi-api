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
      policeForce: registration.police_force.name,
      cdoExpiry: registration.cdo_expiry,
      joinedExemptionScheme: registration.joined_exemption_scheme,
      nonComplianceLetterSent: registration.non_compliance_letter_sent
    }
  }
}

module.exports = {
  mapSummaryCdoDaoToDto
}
