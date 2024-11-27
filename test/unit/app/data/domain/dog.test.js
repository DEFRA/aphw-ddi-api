const { Dog, BreachCategory } = require('../../../../../app/data/domain')
const { buildCdoDog } = require('../../../../mocks/cdo/domain')
const { DuplicateResourceError } = require('../../../../../app/errors/duplicate-record')
const { InvalidDataError } = require('../../../../../app/errors/domain/invalidData')
const { allBreaches } = require('../../../../mocks/cdo/domain')

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
      dateOfBirth: '1999-01-01',
      dateOfDeath: null,
      tattoo: '',
      colour: '',
      sex: '',
      dateExported: null,
      dateStolen: null,
      dateUntraceable: null,
      microchipNumber2: null
    }))
    expect(dog.microchipNumber).toBe('123456789012345')
    expect(dog.status).toBe('Interim exempt')
    expect(dog.breaches).toEqual([])
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
      expect(() => dog.setMicrochipNumber('123456789012345', '123456789012345', callback)).toThrow(new DuplicateResourceError('Microchip number already exists', { microchipNumbers: ['123456789012345'] }))
    })

    test('should throw InvalidDataError error given microchip number contains a letter', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(() => dog.setMicrochipNumber('123a56789012345', null, callback)).toThrow(new InvalidDataError('Microchip number must be digits only'))
    })

    test('should throw InvalidDataError error when updating microchip number that is shorter than 15 characters', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(() => dog.setMicrochipNumber('12345678901234', null, callback)).toThrow(new InvalidDataError('Microchip number must be 15 digits in length'))
    })

    test('should throw InvalidDataError error when updating microchip number that is longer than 15 characters', () => {
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({ microchipNumber: null }))
      expect(() => dog.setMicrochipNumber('1234567890123456', null, callback)).toThrow(new InvalidDataError('Microchip number must be 15 digits in length'))
    })
  })

  describe('setBreaches', () => {
    test('should set a list of breaches on a new Cdo', () => {
      const dog = new Dog(buildCdoDog({}))
      const breaches = [
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_ADDR_30_DAYS_IN_YR'
      ]
      const callback = jest.fn()
      dog.setBreaches(breaches, allBreaches, callback)
      expect(dog.status).toBe('In breach')
      expect(dog.breaches).toEqual([
        new BreachCategory({
          id: 2,
          label: 'dog not kept on lead or muzzled',
          short_name: 'NOT_ON_LEAD_OR_MUZZLED'
        }),
        new BreachCategory({
          id: 4,
          label: 'dog away from registered address for over 30 days in one year',
          short_name: 'AWAY_FROM_ADDR_30_DAYS_IN_YR'
        })
      ])
      expect(dog.getChanges()).toEqual([
        {
          key: 'dogBreaches',
          value: [
            new BreachCategory({
              id: 2,
              label: 'dog not kept on lead or muzzled',
              short_name: 'NOT_ON_LEAD_OR_MUZZLED'
            }),
            new BreachCategory({
              id: 4,
              label: 'dog away from registered address for over 30 days in one year',
              short_name: 'AWAY_FROM_ADDR_30_DAYS_IN_YR'
            })
          ],
          callback: undefined
        },
        {
          key: 'status',
          value: 'In breach',
          callback
        }
      ])
    })
  })

  describe('Date of Birth', () => {
    const thisMorning = new Date()
    thisMorning.setUTCHours(0, 0, 0, 0)

    const sixteenMonths = new Date()
    sixteenMonths.setUTCMonth(sixteenMonths.getUTCMonth() - 16)

    const youngerThanSixteenMonths = new Date(sixteenMonths)
    youngerThanSixteenMonths.setUTCDate(youngerThanSixteenMonths.getUTCDate() + 1)
    youngerThanSixteenMonths.setUTCMilliseconds(youngerThanSixteenMonths.getUTCMilliseconds() - 1)

    test('should show if Dog is under 16 months', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: youngerThanSixteenMonths
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonths).toBe(true)
    })

    test('should show if Dog is 16 months or older', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: sixteenMonths
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonths).toBe(false)
    })

    test('should show if Dog DOB is undefined', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: undefined
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonths).toBe(undefined)
    })

    test('should show if Dog DOB is null', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: null
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonths).toBe(undefined)
    })
  })
})
