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
    expect(csvDataArray[0]).toBe('"P-123-456"')
    expect(csvDataArray[1]).toBe('"John"')
    expect(csvDataArray[2]).toBe('"Smith"')
    expect(csvDataArray[4]).toBe('"new address line 1"')
    expect(csvDataArray[8]).toBe('"new postcode"')
    expect(csvDataArray[9]).toBe('"new country"')
    expect(csvDataArray[10]).toBe('"me@here.com"')
  })

  test('convertToCsv should handle valid input row with some missing data', async () => {
    const rows = [validRowButMissingData]
    const csv = await convertToCsv(rows)
    const csvHeader = csv.substring(0, csv.indexOf('\n'))
    const csvData = csv.substring(csv.indexOf('\n') + 1)
    expect(csvHeader).toBe(validHeader)
    const csvDataArray = csvData.split(',')
    console.log('csvData', csvData)
    expect(csvDataArray[0]).toBe('"P-123-456"')
    expect(csvDataArray[1]).toBe('"John"')
    expect(csvDataArray[2]).toBe('"Smith"')
    expect(csvDataArray[4]).toBe('')
    expect(csvDataArray[8]).toBe('')
    expect(csvDataArray[9]).toBe('')
    expect(csvDataArray[10]).toBe('')
  })
})

const validHeader = '"OwnerReference","OwnerFirstName","OwnerLastName","OwnerDateOfBirth","AddressLine1","AddressLine2","Town","County","Postcode","Country","Email","Telephone1","Telephone2","IndexNumber","DogBreed","DogName","DogDateOfBirth","DogDateOfDeath","DogTattoo","DogColour","DogSex","DogMicrochip1","DogMicrochip2","DogExportedDate","DogStolenDate","ExemptionStatus","CertificateIssued","CdoIssued","CdoExpiry","Court","PoliceForce","DogLegislationOfficer","ApplicationFeePaid","InsuranceCompany","InsuranceRenewalDate","NeuteringConfirmationDate","MicrochipVerificationDate","JoinedInterimSchemeDate"'
