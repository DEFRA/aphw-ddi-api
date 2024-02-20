const { getMicrochip, extractLatestAddress, extractLatestInsurance, extractEmail, extractLatestPrimaryTelephoneNumber, extractLatestSecondaryTelephoneNumber, truncDate } = require('../dto/dto-helper')

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
    row.untraceable_date,
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
    exemption.joined_exemption_scheme,
    exemption.removed_from_cdo_process,
    exemption.exemption_order?.exemption_order,
    exemption.withdrawn,
    exemption.typed_by_dlo,
    exemption.microchip_deadline,
    exemption.neutering_deadline
  ]
}

const headerRow = [
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
  'DogUntraceableDate',
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
  'JoinedInterimSchemeDate',
  'RemovedFromCdoProcess',
  'ExemptionOrder',
  'Withdrawn',
  'ExaminedByDlo',
  'MicrochipDeadline',
  'NeuteringDeadline'
]

module.exports = {
  convertToCsv
}
