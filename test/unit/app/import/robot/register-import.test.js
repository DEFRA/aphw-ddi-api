jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')

const mockRegister = require('../../../../mocks/register/register-xlsx')

jest.mock('../../../../../app/import/robot/police')
const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

jest.mock('../../../../../app/lookups/police-force')
const getPoliceForce = require('../../../../../app/lookups/police-force')

const { importRegister } = require('../../../../../app/import/robot')

describe('register import', () => {
  beforeEach(() => {
    mockReadXlsxFile.mockReturnValue(mockRegister)
    getPoliceForce.mockResolvedValue({ id: 1, name: 'police force 1' })
  })

  test('should return register rows from xlsx', async () => {
    lookupPoliceForceByPostcode.mockResolvedValue(null)
    const { add } = await importRegister([])

    expect(mockReadXlsxFile).toHaveBeenCalledTimes(1)
    expect(add).toHaveLength(3)
  })

  test('should group approved dogs under owner', async () => {
    lookupPoliceForceByPostcode.mockResolvedValue(null)
    const { add } = await importRegister([])

    const owner = add.find(p => p.owner.lastName === 'Poppins')

    expect(owner.dogs).toHaveLength(3)

    expect(owner.dogs[0].name).toEqual('Fred')
    expect(owner.dogs[0].colour).toEqual('Brown')

    expect(owner.dogs[1].name).toEqual('Max')
    expect(owner.dogs[1].colour).toEqual('grey')
  })

  test('should find police force', async () => {
    lookupPoliceForceByPostcode.mockResolvedValue({ id: 5, name: 'police force 5' })
    const { add } = await importRegister([])

    expect(add).toHaveLength(3)
    expect(add[0].owner.policeForceId).toBe(1)
  })
})
