jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')

const mockRegister = require('../../../../mocks/register/register-xlsx')
const mockInvalidRegister = require('../../../../mocks/register/invalid-register-xlsx')

jest.mock('../../../../../app/import/robot/police')
const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

jest.mock('../../../../../app/lookups/police-force')
const getPoliceForce = require('../../../../../app/lookups/police-force')

const { importRegister } = require('../../../../../app/import/robot')

describe('register import', () => {
  beforeEach(() => {
    mockReadXlsxFile.mockReturnValue(mockRegister)
    getPoliceForce.mockResolvedValue({ id: 1, name: 'police force 1' })
    lookupPoliceForceByPostcode.mockResolvedValue({ name: 'police force 1' })
  })

  test('should return register rows from xlsx', async () => {
    const { add } = await importRegister([])

    expect(mockReadXlsxFile).toHaveBeenCalledTimes(1)
    expect(add).toHaveLength(3)
  })

  test('should return error when no xlsx file', async () => {
    mockReadXlsxFile.mockImplementation(() => { throw new Error('dummy error') })
    const res = await importRegister([])
    expect(res.errors).toEqual(['Error reading xlsx file: Error: dummy error'])
  })

  test('should group approved dogs under owner', async () => {
    const { add } = await importRegister([])

    const owner = add.find(p => p.owner.lastName === 'Poppins')

    expect(owner.dogs).toHaveLength(3)

    expect(owner.dogs[0].name).toEqual('Fred')
    expect(owner.dogs[0].colour).toEqual('Brown')

    expect(owner.dogs[1].name).toEqual('Max')
    expect(owner.dogs[1].colour).toEqual('grey')
  })

  test('should leave police force blank if not provided', async () => {
    const { add } = await importRegister([])

    expect(add).toHaveLength(3)
    expect(add[0].owner.policeForceId).toBe(undefined)
  })

  test('should handle failed schema rows', async () => {
    mockReadXlsxFile.mockReturnValue(mockInvalidRegister)
    lookupPoliceForceByPostcode.mockResolvedValue(null)

    const { errors } = await importRegister([])

    expect(errors).toHaveLength(1)
    expect(errors[0]).toBe('Row 1 IndexNumber 1234 "owner.address.addressLine1" is required,"owner.address.postcode" is required')
  })
})
