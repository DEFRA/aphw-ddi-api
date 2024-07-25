const Cdo = require('../../../../../app/data/domain/cdo')
const Person = require('../../../../../app/data/domain/person')
const Dog = require('../../../../../app/data/domain/dog')
const Exemption = require('../../../../../app/data/domain/exemption')
const { buildCdoPerson, buildCdoDog, buildExemption, buildCdo } = require('../../../../mocks/cdo/domain')

describe('Cdo', () => {
  test('should build a cdo', () => {
    const person = new Person(buildCdoPerson())
    const dog = new Dog(buildCdoDog())
    const exemption = new Exemption(buildExemption())
    expect(new Cdo(person, dog, exemption)).toEqual(expect.objectContaining(buildCdo()))
  })
})
