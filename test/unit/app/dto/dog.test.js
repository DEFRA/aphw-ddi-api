const { buildDogDao, dogBreachDAOs } = require('../../../mocks/cdo/get')
const { dogDto } = require('../../../../app/dto/dog')
describe('dog DTO', () => {
  describe('dogDto', () => {
    test('should map a dog DAO to a dog DTO', () => {
      const dogDao = buildDogDao({
        dog_breaches: dogBreachDAOs
      })
      const expectedDogDto = {
        id: 300097,
        indexNumber: 'ED300097',
        name: 'Rex300',
        breed: 'XL Bully',
        colour: null,
        sex: null,
        dateOfBirth: null,
        dateOfDeath: null,
        tattoo: null,
        microchipNumber: null,
        microchipNumber2: null,
        dateExported: null,
        dateStolen: null,
        dateUntraceable: null,
        breaches: [
          'dog not covered by third party insurance',
          'dog kept in insecure place',
          'dog away from registered address for over 30 days in one year'
        ]
      }

      expect(dogDto(dogDao)).toEqual(expectedDogDto)
    })
  })
})
