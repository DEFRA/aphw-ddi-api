const { getMicrochip } = require('../dto/dto-helper')

const convertToCsv = (rows) => {
  const csvRows = []
  csvRows.push(headerRow)
  rows.forEach(x => {
    csvRows.push(convertRow(x))
  })
  return csvRows
    .map(v =>
      v.map(x => (isNaN(x) ? `"${x?.replace(/"/g, '""')}"` : x)).join(',')
    )
    .join('\n')
}

const convertRow = (row) => {
  const owner = row.registered_person[0].person
  const latestAddress = extractLatestAddress(owner.addresses)
  const exemption = row.registration
  const latestInsurance = extractLatestInsurance(row.insurance)
  return [
    // Owner
    owner.person_reference,
    owner.first_name,
    owner.last_name,
    owner.birth_date,
    latestAddress.address_line_1 ?? '',
    latestAddress.address_line_2 ?? '',
    latestAddress.town ?? '',
    latestAddress.county ?? '',
    latestAddress.postcode ?? '',
    latestAddress.country ?? '',
    extractEmail(owner.person_contacts),
    extractLatestPrimaryTelephoneNumber(owner.person_contacts),
    extractLatestSecondaryTelephoneNumber(owner.person_contacts),
    // Dog
    row.index_number,
    row.dog_breed.breed,
    row.name,
    row.birth_date,
    row.death_date,
    row.tattoo,
    row.colour,
    row.sex,
    getMicrochip(row, 1),
    getMicrochip(row, 2),
    row.exported_date,
    row.stolen_date,
    // Exemption
    row.status.status,
    exemption.certificate_issued,
    exemption.cdo_issued,
    exemption.cdo_expiry,
    exemption.court?.name,
    exemption.police_force?.name,
    exemption.legislation_officer,
    exemption.application_fee_paid,
    latestInsurance?.company?.company_name ?? '',
    truncDate(latestInsurance?.renewal_date),
    exemption.neutering_confirmation,
    exemption.microchip_verification,
    exemption.joined_exemption_scheme
  ]
}

const headerRow = [
  // Owner
  'OwnerReference',
  'OwnerFirstName',
  'OwnerLastName',
  'OwnerDateOfBirth',
  'AddressLine1',
  'AddressLine2',
  'Town',
  'County',
  'Postcode',
  'Country',
  'Email',
  'Telephone1',
  'Telephone2',
  // Dog
  'IndexNumber',
  'DogBreed',
  'DogName',
  'DogDateOfBirth',
  'DogDateOfDeath',
  'DogTattoo',
  'DogColour',
  'DogSex',
  'DogMicrochip1',
  'DogMicrochip2',
  'DogExportedDate',
  'DogStolenDate',
  // Exemption
  'ExemptionStatus',
  'CertificateIssued',
  'CdoIssued',
  'CdoExpiry',
  'Court',
  'PoliceForce',
  'DogLegislationOfficer',
  'ApplicationFeePaid',
  'InsuranceCompany',
  'InsuranceRenewalDate',
  'NeuteringConfirmationDate',
  'MicrochipVerificationDate',
  'JoinedInterimSchemeDate'
]

const extractEmail = (contacts) => {
  if (!contacts || contacts.length === 0) {
    return ''
  }
  const email = contacts.filter(x => x.contact.contact_type.contact_type === 'Email').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)
  return email.length > 0 ? email[0] : null
}

const extractLatestPrimaryTelephoneNumber = (contacts) => {
  if (contacts && contacts.length > 0) {
    const primaryPhones = contacts.filter(x => x.contact.contact_type.contact_type === 'Phone').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)
    if (primaryPhones.length > 0) {
      return primaryPhones[0]
    }
  }
  return null
}

const extractLatestSecondaryTelephoneNumber = (contacts) => {
  if (contacts && contacts.length > 0) {
    const secondaryPhones = contacts.filter(x => x.contact.contact_type.contact_type === 'SecondaryPhone').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)
    if (secondaryPhones.length > 0) {
      return secondaryPhones[0]
    }
  }
  return null
}

const extractLatestAddress = (addresses) => {
  if (addresses == null || addresses.length === 0) {
    return {}
  }
  const latestAddress = addresses.sort(propertyComparatorDesc('address', 'id'))[0].address
  return {
    address_line_1: latestAddress.address_line_1,
    address_line_2: latestAddress.address_line_2,
    town: latestAddress.town,
    postcode: latestAddress.postcode,
    county: latestAddress.county,
    country: latestAddress.country?.country
  }
}

const extractLatestInsurance = (insurances) => {
  if (insurances == null || insurances.length === 0) {
    return {}
  }
  return insurances.sort(propertyComparatorDesc('id'))[0]
}

const propertyComparatorDesc = (propertyName, childPropertyName) => {
  return function (a, b) {
    return childPropertyName ? b[propertyName][childPropertyName] - a[propertyName][childPropertyName] : b[propertyName] - a[propertyName]
  }
}

const truncDate = (inDate) => {
  if (!inDate) {
    return ''
  }
  let day = inDate.getDate()
  if (parseInt(day) < 10) {
    day = `0${day}`
  }
  let month = inDate.getMonth() + 1
  if (parseInt(month) < 10) {
    month = `0${month}`
  }
  const year = inDate.getFullYear()
  return `${year}-${month}-${day}`
}

module.exports = {
  convertToCsv
}
