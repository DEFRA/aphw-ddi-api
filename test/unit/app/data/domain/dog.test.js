const Dog = require('../../../../../app/data/domain/dog')

describe('Dog', () => {
  test('should create a dog', () => {
    const dogProperties = {
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
    }

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
})
