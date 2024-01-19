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
    expect(csvDataArray[12]).toBe('"John"')
    expect(csvDataArray[13]).toBe('"Smith"')
    expect(csvDataArray[15]).toBe('"new address line 1"')
    expect(csvDataArray[19]).toBe('"new postcode"')
    expect(csvDataArray[20]).toBe('"new country"')
    expect(csvDataArray[21]).toBe('"me@here.com"')
  })

  test('convertToCsv should handle valid input row with some missing data', async () => {
    const rows = [validRowButMissingData]
    const csv = await convertToCsv(rows)
    const csvHeader = csv.substring(0, csv.indexOf('\n'))
    const csvData = csv.substring(csv.indexOf('\n') + 1)
    expect(csvHeader).toBe(validHeader)
    const csvDataArray = csvData.split(',')
    expect(csvDataArray[12]).toBe('"John"')
    expect(csvDataArray[13]).toBe('"Smith"')
    expect(csvDataArray[15]).toBe('')
    expect(csvDataArray[19]).toBe('')
    expect(csvDataArray[20]).toBe('')
    expect(csvDataArray[21]).toBe('')
  })
})

const validHeader = '"IndexNumber","DogBreed","DogName","DogDateOfBirth","DogDateOfDeath","DogTattoo","DogColour","DogSex","DogMicrochip1","DogMicrochip2","DogExportedDate","DogStolenDate","OwnerFirstName","OwnerLastName","OwnerDateOfBirth","AddressLine1","AddressLine2","Town","County","Postcode","Country","Email","Telephone1","Telephone2","ExemptionStatus","CertificateIssued","CdoIssued","CdoExpiry","Court","PoliceForce","DogLegislationOfficer","ApplicationFeePaid","InsuranceCompany","InsuranceRenewalDate","NeuteringConfirmationDate","MicrochipVerificationDate","JoinedInterimSchemeDate","ExemptionOrder","Withdrawn","ExamindByDlo","MicrochipDeadline","RemovedFromCdoProcess"'
