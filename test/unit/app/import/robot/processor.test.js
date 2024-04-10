const { processRegisterRows, populatePoliceForce } = require('../../../../../app/import/robot/processor')

jest.mock('../../../../../app/repos/cdo')
const { createCdo } = require('../../../../../app/repos/cdo')

jest.mock('../../../../../app/lib/db-functions')
const { dbFindOne } = require('../../../../../app/lib/db-functions')

jest.mock('../../../../../app/import/robot/police')
const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

jest.mock('../../../../../app/lookups/police-force')
const getPoliceForce = require('../../../../../app/lookups/police-force')

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

  test('should handle error is DB error', async () => {
    createCdo.mockImplementation(() => { throw new Error('dummy error') })

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

  test('should populate police force', async () => {
    const mockSave = jest.fn()
    lookupPoliceForceByPostcode.mockResolvedValue({ name: 'police force 1' })
    getPoliceForce.mockResolvedValue({ id: 123 })
    dbFindOne.mockResolvedValue({ save: mockSave })

    const data = {
      add: [
        {
          owner: {
            firstName: 'John',
            phoneNumber: '0123456789012',
            address: {
              postcode: 'AB1 2CD'
            }
          },
          dogs: [{
            name: 'Bruno',
            gender: 'Male',
            colour: 'Brown',
            birthDate: new Date(2020, 1, 5),
            insuranceStartDate: new Date(2023, 11, 10)
          }]
        }
      ]
    }

    await populatePoliceForce(data)

    expect(mockSave).toHaveBeenCalled()
  })

  test('should show errors for police force', async () => {
    const mockSave = jest.fn()
    lookupPoliceForceByPostcode.mockResolvedValue({ name: 'police force 1' })
    getPoliceForce.mockResolvedValue()
    dbFindOne.mockResolvedValue({ save: mockSave })

    const data = {
      add: [
        {
          owner: {
            firstName: 'John',
            phoneNumber: '0123456789012',
            address: {
              postcode: 'AB1 2CD'
            }
          },
          dogs: [{
            name: 'Bruno',
            gender: 'Male',
            colour: 'Brown',
            birthDate: new Date(2020, 1, 5),
            insuranceStartDate: new Date(2023, 11, 10)
          }]
        }
      ]
    }

    await populatePoliceForce(data)

    expect(mockSave).not.toHaveBeenCalled()
  })

  test('should throw error', async () => {
    lookupPoliceForceByPostcode.mockResolvedValue({ name: 'police force 1' })
    getPoliceForce.mockResolvedValue({ id: 123 })
    dbFindOne.mockResolvedValue()

    const data = {
      add: [
        {
          owner: {
            firstName: 'John',
            phoneNumber: '0123456789012',
            address: {
              postcode: 'AB1 2CD'
            }
          },
          dogs: [{
            name: 'Bruno',
            gender: 'Male',
            colour: 'Brown',
            birthDate: new Date(2020, 1, 5),
            insuranceStartDate: new Date(2023, 11, 10)
          }]
        }
      ]
    }

    await expect(populatePoliceForce(data)).rejects.toThrow('CDO not found - indexNumber undefined')
  })
})
