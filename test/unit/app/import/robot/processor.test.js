const { processRegisterRows } = require('../../../../../app/import/robot/processor')

jest.mock('../../../../../app/repos/cdo')
const { createCdo } = require('../../../../../app/repos/cdo')

describe('Processor tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should process rows', async () => {
    createCdo.mockResolvedValue()

    const data = {
      add: [
        {
          owner: {
            firstName: 'John',
            phoneNumber: '0123456789012'
          },
          dogs: [{
            name: 'Bruno',
            gender: 'Male',
            colour: 'Brown',
            birthDate: new Date(2020, 1, 5),
            insuranceStartDate: new Date(2023, 11, 10)
          }]
        },
        {
          owner: {
            firstName: 'Mark',
            phoneNumber: 222456789222
          },
          dogs: [{
            name: 'Fido',
            gender: 'Male',
            colour: 'Black',
            birthDate: new Date(2021, 2, 6),
            insuranceStartDate: new Date(2023, 10, 6)
          }]
        }
      ]
    }

    await processRegisterRows(data, {})

    expect(createCdo).toHaveBeenCalledTimes(2)
  })
})
