/**
 * @param {Partial<CountryDao>} partialCountry
 * @return {CountryDao}
 */
const buildCountryDao = (partialCountry = {}) => ({
  id: 1,
  country: 'England',
  ...partialCountry
})

const country = buildCountryDao()

/**
 *
 * @param {AddressDao} addressPartial
 * @return {AddressDao}
 */
const buildAddressDao = (addressPartial = {}) => ({
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
  country: buildCountryDao(),
  ...addressPartial
})

const address = buildAddressDao()

/**
 * @param {Partial<PersonAddressDao>} personAddress
 * @return {PersonAddressDao}
 */
const buildPersonAddressDao = (personAddress = {}) => ({
  id: 110,
  person_id: 90,
  address_id: 110,
  created_at: new Date('2024-06-24T09:12:07.814Z'),
  deleted_at: null,
  updated_at: new Date('2024-06-24T09:12:07.867Z'),
  address: buildAddressDao(),
  ...personAddress
})

const personAddress = buildPersonAddressDao()

/**
 * @param {Partial<PersonDao>} personPartial
 * @return {PersonDao}
 */
const buildPersonDao = (personPartial = {}) => ({
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
    buildPersonAddressDao()
  ],
  organisation: null,
  person_contacts: [],
  ...personPartial
})

const person = buildPersonDao()

/**
 * @param {Partial<RegisteredPersonDao>} registeredPersonPartial
 * @return {RegisteredPersonDao}
 */
const buildRegisteredPersonDao = (registeredPersonPartial = {}) => ({
  id: 96,
  person_id: 90,
  dog_id: 300097,
  person_type_id: 1,
  created_at: '2024-06-24T09:12:07.814Z',
  deleted_at: null,
  updated_at: '2024-06-24T09:12:07.904Z',
  person: buildPersonDao(),
  ...registeredPersonPartial
})

/**
 * @type {RegisteredPersonDao}
 */
const registeredPerson = buildRegisteredPersonDao()

/**
 * @param {Partial<DogBreedDao>} dogBreedPartial
 * @return {DogBreedDao}
 */
const buildDogBreedDao = (dogBreedPartial = {}) => ({
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
const dogBreed = buildDogBreedDao()

/**
 *
 * @param {Partial<StatusDao>} statusPartial
 * @return {StatusDao}
 */
const buildStatusDao = (statusPartial = {}) => ({
  id: 4,
  status: 'Interim exempt',
  status_type: 'STANDARD',
  ...statusPartial
})

const status = buildStatusDao()

/**
 *
 * @param {PoliceForceDao} partialPoliceForce
 * @return {PoliceForceDao}
 */
const buildPoliceForceDao = (partialPoliceForce = {}) => ({
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
const policeForce = buildPoliceForceDao()

/**
 *
 * @param {Partial<CourtDao>} partialCourt
 * @return {CourtDao}
 */
const buildCourtDao = (partialCourt = {}) => ({
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
const court = buildCourtDao()

const exemptionOrder2015 = {
  id: 1,
  exemption_order: '2015',
  active: true
}

/**
 * @param {RegistrationDao} registrationPartial
 * @return {RegistrationDao}
 */
const buildRegistrationDao = (registrationPartial = {}) => ({
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
  application_pack_sent: null,
  form_two_sent: null,
  created_at: '2024-06-24T09:12:07.897Z',
  updated_at: '2024-06-24T09:12:07.897Z',
  police_force: buildPoliceForceDao(),
  court: buildCourtDao(),
  exemption_order: exemptionOrder2015,
  ...registrationPartial
})

const registration = buildRegistrationDao()

/**
 * @param {MicrochipDao} microchipPartial
 * @return {MicrochipDao}
 */
const buildMicrochipDao = (microchipPartial = {}) => ({
  id: 5,
  microchip_number: '123456789012345',
  created_at: '2024-06-24T10:38:07.868Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:07.902Z',
  ...microchipPartial
})

const microchip = buildMicrochipDao()

/**
 * @param {DogMicrochipDao} partialDogMicrochip
 * @return {DogMicrochipDao}
 */
const buildDogMicrochipDao = (partialDogMicrochip = {}) => ({
  id: 5,
  dog_id: 300097,
  microchip_id: 5,
  created_at: '2024-06-24T10:38:07.868Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:07.910Z',
  microchip: buildMicrochipDao(),
  ...partialDogMicrochip
})

const dogMicrochip = buildDogMicrochipDao()

/**
 * @param {Partial<{id: number; company_name: string}>} insuranceCompanyPartial
 * @return {{id: number; company_name: string}}
 */
const buildInsuranceCompanyDao = (insuranceCompanyPartial = {}) => ({
  id: 4,
  company_name: 'Allianz',
  created_at: '2024-06-14T10:02:17.613Z',
  deleted_at: null,
  updated_at: '2024-06-14T10:02:17.616Z',
  ...insuranceCompanyPartial
})

const insuranceCompany = buildInsuranceCompanyDao()

/**
 * @param {InsuranceDao} insurance
 * @return {InsuranceDao}
 */
const buildInsuranceDao = (insurance = {}) => ({
  id: 9,
  policy_number: null,
  company_id: 4,
  renewal_date: '2024-01-01T00:00:00.000Z',
  created_at: '2024-06-24T10:38:32.934Z',
  deleted_at: null,
  updated_at: '2024-06-24T10:38:32.954Z',
  dog_id: 300097,
  company: buildInsuranceCompanyDao(),
  ...insurance
})

const insurance = buildInsuranceDao()

/**
 * @param {Partial<CdoDao>} cdoPartial
 * @return {CdoDao}
 */
const buildCdoDao = (cdoPartial = {}) => ({
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
    buildRegisteredPersonDao()
  ],
  dog_breed: buildDogBreedDao(),
  status: buildStatusDao(),
  registration: buildRegistrationDao(),
  insurance: [],
  dog_microchips: [],
  ...cdoPartial
})

const cdo = buildCdoDao()

/**
 * @param {Partial<BreachCategory>} dogBreachCategory
 * @return {BreachCategory}
 */
const buildBreachCategory = (breachCategory = {}) => ({
  id: 4,
  label: 'dog away from registered address for over 30 days in one year',
  short_name: 'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR',
  ...breachCategory
})

const NOT_COVERED_BY_INSURANCE = buildBreachCategory({ id: 1, label: 'dog not covered by third party insurance', short_name: 'NOT_COVERED_BY_INSURANCE' })
const INSECURE_PLACE = buildBreachCategory({ id: 3, label: 'dog kept in insecure place', short_name: 'INSECURE_PLACE' })
const AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR = buildBreachCategory({ id: 4, label: 'dog away from registered address for over 30 days in one year', short_name: 'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR' })

const buildDogBreach = (dogBreach) => ({
  id: 2,
  dog_id: 300097,
  breach_category_id: 4,
  created_at: '2024-07-17T18:04:29.075Z',
  deleted_at: null,
  updated_at: null,
  breach_category: buildBreachCategory(),
  ...dogBreach
})

const dogBreaches = [
  buildDogBreach({
    id: 1,
    breach_category_id: 1,
    breach_category: NOT_COVERED_BY_INSURANCE
  }),
  buildDogBreach({
    id: 2,
    breach_category_id: 3,
    breach_category: INSECURE_PLACE
  }),
  buildDogBreach({
    id: 3,
    breach_category_id: 4,
    breach_category: AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR
  })
]

const allBreaches = [
  buildBreachCategory({
    id: 1,
    label: 'dog not covered by third party insurance',
    short_name: 'NOT_COVERED_BY_INSURANCE'
  }),
  buildBreachCategory({
    id: 2,
    label: 'dog not kept on lead or muzzled',
    short_name: 'NOT_ON_LEAD_OR_MUZZLED'
  }),
  buildBreachCategory({
    id: 3,
    label: 'dog kept in insecure place',
    short_name: 'INSECURE_PLACE'
  }),
  buildBreachCategory({
    id: 4,
    label: 'dog away from registered address for over 30 days in one year',
    short_name: 'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR'
  }),
  buildBreachCategory({
    id: 5,
    label: 'exemption certificate not provided to police',
    short_name: 'EXEMPTION_NOT_PROVIDED_TO_POLICE'
  }),
  buildBreachCategory({
    id: 6,
    label: 'insurance evidence not provided to police',
    short_name: 'INSURANCE_NOT_PROVIDED_TO_POLICE'
  }),
  buildBreachCategory({
    id: 7,
    label: 'owner not allowed police to read microchip',
    short_name: 'POLICE_PREVENTED_FROM_READING_MICROCHIP'
  }),
  buildBreachCategory({
    id: 8,
    label: 'change of registered address not provided to Defra',
    short_name: 'CHANGE_OF_REGISTERED_ADDRESS_NOT_PROVIDED'
  }),
  buildBreachCategory({
    id: 9,
    label: 'death of dog not reported to Defra',
    short_name: 'DOG_DEATH_NOT_REPORTED'
  }),
  buildBreachCategory({
    id: 10,
    label: 'dog’s export not reported to Defra',
    short_name: 'DOG_EXPORT_NOT_REPORTED'
  })
]

/**
 * @param {Partial<DogDao>} dogDao
 * @return {DogDao}
 */
const buildDogDao = (dogDao = {}) => ({
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
    buildRegisteredPersonDao()
  ],
  dog_breed: buildDogBreedDao(),
  status: buildStatusDao(),
  dog_microchips: [],
  dog_breaches: [],
  ...dogDao
})

module.exports = {
  buildCountryDao,
  country,
  buildAddressDao,
  address,
  buildPersonAddressDao,
  personAddress,
  buildPersonDao,
  person,
  buildRegisteredPersonDao,
  registeredPerson,
  buildDogBreedDao,
  dogBreed,
  buildStatusDao,
  status,
  buildPoliceForceDao,
  policeForce,
  buildCourtDao,
  court,
  exemptionOrder2015,
  buildRegistrationDao,
  registration,
  buildMicrochipDao,
  microchip,
  buildDogMicrochipDao,
  dogMicrochip,
  buildInsuranceCompanyDao,
  insuranceCompany,
  buildInsuranceDao,
  insurance,
  buildCdoDao,
  cdo,
  buildDogDao,
  dogBreaches,
  allBreaches
}
