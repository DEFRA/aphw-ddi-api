const { buildDogBreachDao, buildBreachCategoryDao } = require('../../../../mocks/cdo/get')
const { BreachCategory } = require('../../../../../app/data/domain')
const { mapDogBreachDaoToBreachCategory } = require('../../../../../app/repos/mappers/dog')

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
