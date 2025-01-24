const { Dog, BreachCategory, Exemption, Person } = require('../../../../../app/data/domain')
const { buildCdoDog, buildExemption } = require('../../../../mocks/cdo/domain')
const { DuplicateResourceError } = require('../../../../../app/errors/duplicate-record')
const { InvalidDataError } = require('../../../../../app/errors/domain/invalidData')
const { allBreaches } = require('../../../../mocks/cdo/domain')
const { DogActionNotAllowedException } = require('../../../../../app/errors/domain/dogActionNotAllowedException')
const { addMonths } = require('../../../../../app/lib/date-helpers')

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
    expect(dog.exemption).toBeUndefined()
  })

  test('should create a dog with exemption', () => {
    const exemption = new Exemption(buildExemption({
      exemptionOrder: '2013'
    }))
    const dog = new Dog(buildCdoDog({
      exemption
    }))
    expect(dog.exemption.exemptionOrder).toBe('2013')
  })

  test('should create a dog with a person', () => {
    const person = new Person({
      firstName: 'Joe'
    })
    const dog = new Dog(buildCdoDog({
      person
    }))
    expect(dog.person.firstName).toBe('Joe')
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
      expect(dog.youngerThanSixteenMonthsAtDate(thisMorning)).toBe(true)
    })

    test('should show if Dog is 16 months or older', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: sixteenMonths
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonthsAtDate(thisMorning)).toBe(false)
    })

    test('should show if Dog DOB is undefined', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: undefined
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonthsAtDate(thisMorning)).toBe(undefined)
    })

    test('should show if Dog DOB is null', () => {
      const dogProperties = buildCdoDog({
        dateOfBirth: null
      })

      const dog = new Dog(dogProperties)
      expect(dog.youngerThanSixteenMonthsAtDate(thisMorning)).toBe(undefined)
    })
  })

  describe('withdrawDog', () => {
    const cb = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('should change status and set date if Dog has not already been withdrawn', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const dog = new Dog(buildCdoDog({
        dateOfBirth: new Date('2023-07-22'),
        status: 'Interim exempt',
        exemption,
        indexNumber: 'ED3000002'
      }))
      expect(dog.exemption.withdrawn).toBeNull()
      expect(dog.status).toBe('Interim exempt')
      dog.withdrawDog(cb)
      expect(dog.status).toBe('Withdrawn')
      expect(dog.exemption.withdrawn).toBeInstanceOf(Date)
      expect(dog.getChanges()).toEqual([
        {
          key: 'status',
          value: 'Withdrawn',
          callback: cb
        }
      ])
      expect(dog.exemption.getChanges()).toEqual([
        {
          key: 'withdrawn',
          value: expect.any(Date)
        }
      ])
    })

    test('should allow withdrawal but not update if dog has already been withdrawn', () => {
      const withdrawn = new Date('2025-01-23')
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023',
        withdrawn
      }))
      const dog = new Dog(buildCdoDog({
        dateOfBirth: new Date('2023-07-22'),
        status: 'Withdrawn',
        exemption,
        indexNumber: 'ED3000002'
      }))
      dog.withdrawDog(cb)
      expect(dog.exemption.withdrawn).toEqual(withdrawn)
      expect(dog.status).toBe('Withdrawn')
      expect(dog.getChanges().length).toBe(0)
    })
    test('should not withdraw dog if exemption does not exist', () => {
      const dog = new Dog(buildCdoDog({}))

      expect(() => dog.withdrawDog(cb)).toThrow(new DogActionNotAllowedException('Exemption not found'))
      expect(cb).not.toHaveBeenCalled()
    })
    test('should not withdraw dog if dog is not 2013 dog', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2015'
      }))
      const dog = new Dog(buildCdoDog({
        exemption,
        indexNumber: 'ED3000002',
        dateOfBirth: new Date('2023-07-23')
      }))

      expect(() => dog.withdrawDog(cb)).toThrow(new DogActionNotAllowedException('Dog ED3000002 is not valid for withdrawal'))
      expect(cb).not.toHaveBeenCalled()
    })
    test('should not withdraw dog if no DOB exists', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const dog = new Dog(buildCdoDog({
        dateOfBirth: undefined,
        exemption,
        indexNumber: 'ED3000002'
      }))

      expect(() => dog.withdrawDog(() => {})).toThrow(new DogActionNotAllowedException('Dog ED3000002 is not valid for withdrawal'))
      expect(cb).not.toHaveBeenCalled()
    })

    test('should not withdraw dog if dog is 2013 dog but is younger than 18 months', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const lessThanEighteenMonthsAgo = addMonths(new Date(), -18)
      lessThanEighteenMonthsAgo.setUTCDate(lessThanEighteenMonthsAgo.getDate() + 1)

      const dog = new Dog(buildCdoDog({
        exemption,
        indexNumber: 'ED3000002',
        dateOfBirth: lessThanEighteenMonthsAgo
      }))

      expect(() => dog.withdrawDog(cb)).toThrow(new DogActionNotAllowedException('Dog ED3000002 is not valid for withdrawal'))
      expect(cb).not.toHaveBeenCalled()
    })
  })
})
