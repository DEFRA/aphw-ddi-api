const { convertToCsv } = require('../../../../app/export/csv')
const { validRow, validRowButMissingData } = require('./input-data')

describe('CSV test', () => {
  test('convertToCsv should handle no input rows', async () => {
    const rows = []
    const csv = await convertToCsv(rows)
    expect(csv).toBe(validHeader)
  })

  test('convertToCsv should handle valid input row', async () => {
    const rows = [validRow]
    const csv = await convertToCsv(rows)
    const csvHeader = csv.substring(0, csv.indexOf('\n'))
    const csvData = csv.substring(csv.indexOf('\n') + 1)
    expect(csvHeader).toBe(validHeader)
    const csvDataArray = csvData.split(',')
    expect(csvDataArray[14]).toBe('"John"')
    expect(csvDataArray[15]).toBe('"Smith"')
    expect(csvDataArray[17]).toBe('"new address line 1"')
    expect(csvDataArray[21]).toBe('"new postcode"')
    expect(csvDataArray[22]).toBe('"new country"')
    expect(csvDataArray[23]).toBe('"me@here.com"')
  })

  test('convertToCsv should handle valid input row with some missing data', async () => {
    const rows = [validRowButMissingData]
    const csv = await convertToCsv(rows)
    const csvHeader = csv.substring(0, csv.indexOf('\n'))
    const csvData = csv.substring(csv.indexOf('\n') + 1)
    expect(csvHeader).toBe(validHeader)
    const csvDataArray = csvData.split(',')
    expect(csvDataArray[14]).toBe('"John"')
    expect(csvDataArray[15]).toBe('"Smith"')
    expect(csvDataArray[17]).toBe('')
    expect(csvDataArray[21]).toBe('')
    expect(csvDataArray[22]).toBe('')
    expect(csvDataArray[23]).toBe('')
  })

  test('convertToCsv should handle valid input row with owner organisation', async () => {
    const rows = [validRow]
    rows[0].registered_person[0].person = { ...rows[0].registered_person[0].person, organisation: { organisation_name: 'Test Organisation' } }
    const csv = await convertToCsv(rows)
    const csvHeader = csv.substring(0, csv.indexOf('\n'))
    const csvData = csv.substring(csv.indexOf('\n') + 1)
    expect(csvHeader).toBe(validHeader)
    const csvDataArray = csvData.split(',')
    expect(csvDataArray[13]).toBe('"Test Organisation"')
    expect(csvDataArray[14]).toBe('"John"')
    expect(csvDataArray[15]).toBe('"Smith"')
    expect(csvDataArray[17]).toBe('"new address line 1"')
    expect(csvDataArray[21]).toBe('"new postcode"')
    expect(csvDataArray[22]).toBe('"new country"')
    expect(csvDataArray[23]).toBe('"me@here.com"')
  })
})

const validHeader = '"IndexNumber","DogBreed","DogName","DogDateOfBirth","DogDateOfDeath","DogTattoo","DogColour","DogSex","DogMicrochip1","DogMicrochip2","DogExportedDate","DogStolenDate","DogUntraceableDate","OwnerOrganisation","OwnerFirstName","OwnerLastName","OwnerDateOfBirth","AddressLine1","AddressLine2","Town","County","Postcode","Country","Email","Telephone1","Telephone2","ExemptionStatus","CertificateIssued","CdoIssued","CdoExpiry","Court","PoliceForce","DogLegislationOfficer","ApplicationFeePaid","InsuranceCompany","InsuranceRenewalDate","NeuteringConfirmationDate","MicrochipVerificationDate","JoinedInterimSchemeDate","NonComplianceLetterSent","ExemptionOrder","Withdrawn","ExaminedByDlo","MicrochipDeadline","NeuteringDeadline"'
