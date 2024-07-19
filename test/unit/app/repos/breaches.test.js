const { BreachCategory } = require('../../../../app/data/domain')
const { buildCdoDog, allBreaches, NOT_ON_LEAD_OR_MUZZLED, INSECURE_PLACE, AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR } = require('../../../mocks/cdo/domain')
const { Dog } = require('../../../../app/data/domain')
const { buildDogDao, buildDogBreachDao } = require('../../../mocks/cdo/get')
/**
 * @type {BreachCategory[]}
 */
const mockBreachCategories = [
  new BreachCategory({
    id: 1,
    label: 'dog not covered by third party insurance',
    short_name: 'NOT_COVERED_BY_INSURANCE'
  }),
  new BreachCategory({
    id: 2,
    label: 'dog not kept on lead or muzzled',
    short_name: 'NOT_ON_LEAD_OR_MUZZLED'
  }),
  new BreachCategory({
    id: 3,
    label: 'dog kept in insecure place',
    short_name: 'INSECURE_PLACE'
  })
]

describe('Breaches repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    col: jest.fn(),
    transaction: jest.fn(),
    models: {
      breach_category: {
        findAll: jest.fn()
      },
      dog_breach: {
        destroy: jest.fn(),
        findAll: jest.fn(),
        bulkCreate: jest.fn()
      },
      dog: {
        findOne: jest.fn(),
        save: jest.fn()
      }
    }
  }))

  jest.mock('../../../../app/repos/dogs')
  const { getDogByIndexNumber } = require('../../../../app/repos/dogs')

  const sequelize = require('../../../../app/config/db')

  const { getBreachCategories, setBreaches } = require('../../../../app/repos/breaches')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getBreachCategories', () => {
    test('getBreachCategories should return breaches', async () => {
      sequelize.models.breach_category.findAll.mockResolvedValue(mockBreachCategories)

      const res = await getBreachCategories()

      expect(res).toEqual(mockBreachCategories)
    })
  })

  describe('setBreaches', () => {
    test('should start a transaction if none exists', async () => {
      sequelize.models.dog_breach.findAll.mockResolvedValue([])
      getDogByIndexNumber.mockResolvedValue(buildDogDao())
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog())
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR'
      ], allBreaches, callback)

      await setBreaches(dog)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })
    test('should set breaches given none exist', async () => {
      const dogDao = buildDogDao()
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog())
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR'
      ], allBreaches, callback)

      await setBreaches(dog, dogDao, {})

      expect(sequelize.models.dog_breach.bulkCreate).toHaveBeenCalledWith([
        {
          dog_id: 300097,
          breach_category_id: 2
        },
        {
          dog_id: 300097,
          breach_category_id: 4
        }
      ], { transaction: {} })
    })

    test('should set breaches given some already exist', async () => {
      const destroyMock = jest.fn()
      const dogDao = buildDogDao({
        dog_breaches: [
          buildDogBreachDao({
            id: 2,
            dog_id: 300097,
            breach_category_id: 2,
            destroy: destroyMock
          }),
          buildDogBreachDao({
            id: 3,
            dog_id: 300097,
            breach_category_id: 3,
            destroy: destroyMock
          }),
          buildDogBreachDao({
            id: 4,
            dog_id: 300097,
            breach_category_id: 4,
            destroy: destroyMock
          })
        ]
      })

      const callback = jest.fn()
      const dog = new Dog(buildCdoDog({
        dogBreaches: [
          NOT_ON_LEAD_OR_MUZZLED,
          INSECURE_PLACE,
          AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR
        ]
      }))
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_REGISTERED_ADDRESS_30_DAYS_IN_YR'
      ], allBreaches, callback)

      await setBreaches(dog, dogDao, {})
      expect(destroyMock).toHaveBeenCalledTimes(3)
      expect(sequelize.models.dog_breach.bulkCreate).toHaveBeenCalledWith([
        {
          dog_id: 300097,
          breach_category_id: 2
        },
        {
          dog_id: 300097,
          breach_category_id: 4
        }
      ], { transaction: {} })
    })
  })
})
