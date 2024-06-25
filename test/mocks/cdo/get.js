/**
 * @param {Partial<CountryDao>} partialCountry
 * @return {CountryDao}
 */
const buildCountry = (partialCountry = {}) => ({
  id: 1,
  country: 'England',
  ...partialCountry
})

const country = buildCountry()

/**
 *
 * @param {AddressDao} addressPartial
 * @return {AddressDao}
 */
const buildAddress = (addressPartial = {}) => ({
  id: 110,
  address_line_1: '300 Anywhere St',
  address_line_2: 'Anywhere Estate',
  town: 'City of London',
  postcode: 'S1 1AA',
  county: null,
  country_id: 1,
  created_at: new Date('2024-06-24T09:12:07.814Z'),
  deleted_at: null,
  updated_at: new Date('2024-06-24T09:12:07.853Z'),
  country: buildCountry(),
  ...addressPartial
})

const address = buildAddress()

/**
 * @param {Partial<PersonAddressDao>} personAddress
 * @return {PersonAddressDao}
 */
const buildPersonAddress = (personAddress = {}) => ({
  id: 110,
  person_id: 90,
  address_id: 110,
  created_at: new Date('2024-06-24T09:12:07.814Z'),
  deleted_at: null,
  updated_at: new Date('2024-06-24T09:12:07.867Z'),
  address: buildAddress(),
  ...personAddress
})

const personAddress = buildPersonAddress()

/**
 * @param {Partial<PersonDao>} personPartial
 * @return {PersonDao}
 */
const buildPerson = (personPartial = {}) => ({
  id: 90,
  first_name: 'Alex',
  last_name: 'Carter',
  person_reference: 'P-8AD0-561A',
  birth_date: new Date('1998-05-10'),
  organisation_id: null,
  created_at: '2024-06-24T09:12:07.814Z',
  deleted_at: null,
  updated_at: '2024-06-24T09:12:07.836Z',
  addresses: [
    buildAddress()
  ],
  organisation: null,
  person_contacts: [],
  ...personPartial
})

const person = buildPerson()

/**
 * @param {Partial<RegisteredPersonDao>} registeredPersonPartial
 * @return {RegisteredPersonDao}
 */
const buildRegisteredPerson = (registeredPersonPartial = {}) => ({
  id: 96,
  person_id: 90,
  dog_id: 300097,
  person_type_id: 1,
  created_at: '2024-06-24T09:12:07.814Z',
  deleted_at: null,
  updated_at: '2024-06-24T09:12:07.904Z',
  person: buildPerson(),
  ...registeredPersonPartial
})

/**
 * @type {RegisteredPersonDao}
 */
const registeredPerson = buildRegisteredPerson()

/**
 * @param {Partial<DogBreedDao>} dogBreedPartial
 * @return {DogBreedDao}
 */
const buildDogBreed = (dogBreedPartial = {}) => ({
  id: 1,
  breed: 'XL Bully',
  active: true,
  display_order: 1,
  created_at: null,
  updated_at: null,
  ...dogBreedPartial
})
/**
 * @type {DogBreedDao}
 */
const dogBreed = buildDogBreed()

/**
 *
 * @param {Partial<StatusDao>} statusPartial
 * @return {StatusDao}
 */
const buildStatus = (statusPartial = {}) => ({
  id: 4,
  status: 'Interim exempt',
  status_type: 'STANDARD',
  ...statusPartial
})

const status = buildStatus()

/**
 *
 * @param {PoliceForceDao} partialPoliceForce
 * @return {PoliceForceDao}
 */
const buildPoliceForce = (partialPoliceForce = {}) => ({
  id: 1,
  name: 'Avon and Somerset Constabulary',
  created_at: null,
  deleted_at: null,
  updated_at: null,
  ...partialPoliceForce
})
/**
 * @type {PoliceForceDao}
 */
const policeForce = buildPoliceForce()

/**
 *
 * @param {Partial<CourtDao>} partialCourt
 * @return {CourtDao}
 */
const buildCourt = (partialCourt = {}) => ({
  id: 1,
  name: 'Aberystwyth Justice Centre',
  created_at: null,
  deleted_at: null,
  updated_at: null,
  ...partialCourt
})

/**
 * @type {CourtDao}
 */
const court = buildCourt()

const exemptionOrder2015 = {
  id: 1,
  exemption_order: '2015',
  active: true
}

/**
 * @param {RegistrationDao} registrationPartial
 * @return {RegistrationDao}
 */
const buildRegistration = (registrationPartial = {}) => ({
  id: 97,
  dog_id: 300097,
  status_id: 1,
  police_force_id: 1,
  court_id: 1,
  exemption_order_id: 1,
  cdo_issued: '2023-10-10',
  cdo_expiry: '2023-12-10',
  time_limit: null,
  certificate_issued: null,
  legislation_officer: 'Sidney Lewis',
  application_fee_paid: null,
  neutering_confirmation: null,
  microchip_verification: null,
  joined_exemption_scheme: '2023-12-10',
  withdrawn: null,
  typed_by_dlo: null,
  microchip_deadline: null,
  neutering_deadline: null,
  non_compliance_letter_sent: null,
  deleted_at: null,
  created_at: '2024-06-24T09:12:07.897Z',
  updated_at: '2024-06-24T09:12:07.897Z',
  police_force: buildPoliceForce(),
  court: buildCourt(),
  exemption_order: exemptionOrder2015,
  ...registrationPartial
})

const registration = buildRegistration()

/**
 * @param {MicrochipDao} microchipPartial
 * @return {MicrochipDao}
 */
const buildMicrochip = (microchipPartial = {}) => ({
  id: 5,
  microchip_number: '123456789012345',
  created_at: '2024-06-24T10:38:07.868Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:07.902Z',
  ...microchipPartial
})

const microchip = buildMicrochip()

/**
 * @param {DogMicrochipDao} partialDogMicrochip
 * @return {DogMicrochipDao}
 */
const buildDogMicrochip = (partialDogMicrochip = {}) => ({
  id: 5,
  dog_id: 300097,
  microchip_id: 5,
  created_at: '2024-06-24T10:38:07.868Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:07.910Z',
  microchip: buildMicrochip()
})

const dogMicrochip = buildDogMicrochip()

/**
 * @param {Partial<{id: number; company_name: string}>} insuranceCompanyPartial
 * @return {{id: number; company_name: string}}
 */
const buildInsuranceCompany = (insuranceCompanyPartial = {}) => ({
  id: 4,
  company_name: 'Allianz',
  created_at: '2024-06-14T10:02:17.613Z',
  deleted_at: null,
  updated_at: '2024-06-14T10:02:17.616Z',
  ...insuranceCompanyPartial
})

const insuranceCompany = buildInsuranceCompany()

/**
 * @param {InsuranceDao} insurance
 * @return {InsuranceDao}
 */
const buildInsurance = (insurance = {}) => ({
  id: 9,
  policy_number: null,
  company_id: 4,
  renewal_date: '2024-01-01T00:00:00.000Z',
  created_at: '2024-06-24T10:38:32.934Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:32.954Z',
  dog_id: 300097,
  company: buildInsuranceCompany()
})

const insurance = buildInsurance()

/**
 * @param {Partial<CdoDao>} cdoPartial
 * @return {CdoDao}
 */
const buildCdo = (cdoPartial = {}) => ({
  id: 300097,
  dog_reference: '5270aad5-77d1-47ce-b41d-99a6e8f6e5fe',
  index_number: 'ED300097',
  dog_breed_id: 1,
  status_id: 4,
  name: 'Rex300',
  birth_date: null,
  death_date: null,
  tattoo: null,
  colour: null,
  sex: null,
  exported_date: null,
  stolen_date: null,
  untraceable_date: null,
  created_at: '2024-06-24T09:12:07.814Z',
  deleted_at: null,
  updated_at: '2024-06-24T09:12:07.885Z',
  registered_person: [
    buildRegisteredPerson()
  ],
  dog_breed: buildDogBreed(),
  status,
  registration,
  insurance: [buildInsurance()],
  dog_microchips: [buildDogMicrochip()],
  ...cdoPartial
})

const cdo = buildCdo()

module.exports = {
  buildCountry,
  country,
  buildAddress,
  address,
  buildPersonAddress,
  personAddress,
  buildPerson,
  person,
  buildRegisteredPerson,
  registeredPerson,
  buildDogBreed,
  dogBreed,
  buildStatus,
  status,
  buildPoliceForce,
  policeForce,
  buildCourt,
  court,
  exemptionOrder2015,
  buildRegistration,
  registration,
  buildMicrochip,
  microchip,
  buildDogMicrochip,
  dogMicrochip,
  buildInsuranceCompany,
  insuranceCompany,
  buildInsurance,
  insurance,
  buildCdo,
  cdo
}
