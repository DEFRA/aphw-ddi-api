const { buildDogBreachDao, buildBreachCategoryDao } = require('../../../../mocks/cdo/get')
const { BreachCategory, Dog } = require('../../../../../app/data/domain')
const { mapDogBreachDaoToBreachCategory, mapDogToDogDto } = require('../../../../../app/repos/mappers/dog')
const { buildDogDto, buildBreachDto } = require('../../../../mocks/cdo/dto')
const { buildCdoDog, NOT_COVERED_BY_INSURANCE, INSECURE_PLACE, AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR } = require('../../../../mocks/cdo/domain')

describe('dog mappers', () => {
  describe('mapDogBreachDaoToBreachCategory', () => {
    test('should map a DogBreachDao to a DogBreach', () => {
      const dogBreachDao = buildDogBreachDao({
        breach_category_id: 5,
        breach_category: buildBreachCategoryDao({
          label: 'exemption certificate not provided to police',
          short_name: 'EXEMPTION_NOT_PROVIDED_TO_POLICE',
          id: 5
        })
      })
      const expectedBreachCategory = new BreachCategory({
        id: 5,
        label: 'exemption certificate not provided to police',
        short_name: 'EXEMPTION_NOT_PROVIDED_TO_POLICE'
      })
      expect(mapDogBreachDaoToBreachCategory(dogBreachDao)).toEqual(expectedBreachCategory)
    })
  })

  describe('mapDogToDogDto', () => {
    test('should map a Dog to a dog DTO', () => {
      const dog = new Dog(buildCdoDog({
        dogBreaches: [
          NOT_COVERED_BY_INSURANCE,
          INSECURE_PLACE,
          AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR
        ]
      }))

      const expectedDogDto = buildDogDto({
        breaches: [
          buildBreachDto('dog not covered by third party insurance'),
          buildBreachDto('dog kept in insecure place'),
          buildBreachDto('dog away from registered address for over 30 days in one year')
        ]
      })

      expect(mapDogToDogDto(dog)).toEqual(expectedDogDto)
    })
  })
})
