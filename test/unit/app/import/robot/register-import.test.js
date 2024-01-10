jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')

const mockRegister = require('../../../../mocks/register/register-xlsx')

const { importRegister } = require('../../../../../app/import/robot')

describe('register import', () => {
  beforeEach(() => {
    mockReadXlsxFile.mockReturnValue(mockRegister)
  })

  test('should return register rows from xlsx', async () => {
    const { add } = await importRegister([])

    expect(mockReadXlsxFile).toHaveBeenCalledTimes(1)
    expect(add).toHaveLength(3)
  })

  test('should group approved dogs under owner', async () => {
    const { add } = await importRegister([])

    const owner = add.find(p => p.lastName === 'Poppins' &&
      p.birthDate.getDate() === new Date(2000, 0, 1).getDate() &&
      p.postcode === 'SW1A 2AA')

    expect(owner.dogs).toHaveLength(3)

    expect(owner.dogs[0].name).toEqual('Fred')
    expect(owner.dogs[0].colour).toEqual('Brown')

    expect(owner.dogs[1].name).toEqual('Max')
    expect(owner.dogs[1].colour).toEqual('grey')
  })
})
