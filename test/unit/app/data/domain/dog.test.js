const Dog = require('../../../../../app/data/domain/dog')
const { buildCdoDog } = require('../../../../mocks/cdo/domain')
const { DuplicateResourceError } = require('../../../../../app/errors/duplicate-record')
const { InvalidDataError } = require('../../../../../app/errors/domain/invalidData')

describe('Dog', () => {
  test('should create a dog', () => {
    const dogProperties = buildCdoDog({
      id: 300097,
      dogReference: '5270aad5-77d1-47ce-b41d-99a6e8f6e5fe',
      indexNumber: 'ED300097',
      name: 'Rex300',
      breed: 'XL Bully',
      status: 'Interim exempt',
      dateOfBirth: '1999-01-01',
      dateOfDeath: null,
      tattoo: '',
      colour: '',
      sex: '',
      dateExported: null,
      dateStolen: null,
      dateUntraceable: null,
      microchipNumber: '123456789012345',
      microchipNumber2: null
    })

    const dog = new Dog(dogProperties)

    expect(dog).toEqual(expect.objectContaining({
      id: 300097,
      dogReference: '5270aad5-77d1-47ce-b41d-99a6e8f6e5fe',
      indexNumber: 'ED300097',
      name: 'Rex300',
      breed: 'XL Bully',
      status: 'Interim exempt',
      dateOfBirth: '1999-01-01',
      dateOfDeath: null,
      tattoo: '',
      colour: '',
      sex: '',
      dateExported: null,
      dateStolen: null,
      dateUntraceable: null,
      microchipNumber: '123456789012345',
      microchipNumber2: null
    }))
    expect(dog).toBeInstanceOf(Dog)
  })

  describe('setMicrochipNumber', () => {
    test('should update a valid microchip number', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(dog.microchipNumber).toBeNull()
      dog.setMicrochipNumber('123456789012345', null, callback)
      expect(dog.getChanges()).toEqual([
        {
          key: 'microchip',
          value: '123456789012345',
          callback
        }
      ])
      expect(dog.microchipNumber).toEqual('123456789012345')
    })

    test('should not update given microchip number is unchanged', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: '123456789012345' }))
      expect(dog.microchipNumber).toEqual('123456789012345')
      dog.setMicrochipNumber('123456789012345', null, callback)

      expect(dog.getChanges()).toEqual([])
      expect(dog.microchipNumber).toEqual('123456789012345')
    })

    test('should not update given microchip number is unchanged & microchip number exists', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: '123456789012345' }))
      expect(dog.microchipNumber).toEqual('123456789012345')
      dog.setMicrochipNumber('123456789012345', '123456789012345', callback)

      expect(dog.getChanges()).toEqual([])
      expect(dog.microchipNumber).toEqual('123456789012345')
    })

    test('should throw Duplicate Record error given microchip number given exists', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(dog.microchipNumber).toBeNull()
      expect(() => dog.setMicrochipNumber('123456789012345', '123456789012345', callback)).toThrow(new DuplicateResourceError('The microchip number already exists', { microchipNumbers: ['123456789012345'] }))
    })

    test('should throw InvalidDataError error given microchip number contains a letter', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(() => dog.setMicrochipNumber('123a56789012345', null, callback)).toThrow(new InvalidDataError('Invalid Microchip number - contains a non-numeric character'))
    })

    test('should throw InvalidDataError error when updating microchip number that is shorter than 15 characters', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(() => dog.setMicrochipNumber('12345678901234', null, callback)).toThrow(new InvalidDataError('Invalid Microchip number - must be at least 15 characters long'))
    })
  })
})
