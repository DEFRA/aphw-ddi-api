jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')

const mockRow = {
  owner: {
    firstName: 'Bill',
    lastName: 'Test',
    address: {
      addressLine1: '319 test street',
      town: 'Swansea',
      country: 'Wales',
      postcode: 'AA1 1AA'
    },
    birthDate: new Date(1970, 3, 28),
    phoneNumber: 3333333333,
    email: 'test@example.com'
  },
  dog: {
    name: 'Pepper',
    birthDate: new Date(2022, 10, 23),
    colour: 'White',
    gender: 'Male',
    insuranceStartDate: new Date(2023, 10, 11),
    neutered: 'Yes',
    microchipNumber: '2134567891',
    indexNumber: 1234,
    certificateIssued: new Date(2021, 10, 11)
  }
}

const { importRegister } = require('../../../../../app/import/robot/importer')

describe('Check max rows tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should handle rows', async () => {
    mockReadXlsxFile.mockReturnValue({ rows: [mockRow] })
    const res = await importRegister([])
    expect(res).not.toBe(null)
    expect(res.errors).toHaveLength(0)
  })

  test('should detect too many rows', async () => {
    const tooManyRows = []
    for (let i = 0; i < 102; i++) {
      tooManyRows.push(mockRow)
    }
    mockReadXlsxFile.mockReturnValue({ rows: tooManyRows })
    const res = await importRegister([])
    expect(res).not.toBe(null)
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toBe('A single import cannot have more than 100 dogs')
  })
})
