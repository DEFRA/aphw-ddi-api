const { BreachCategory } = require('../../../../app/data/domain')
const { buildCdoDog, allBreaches, NOT_ON_LEAD_OR_MUZZLED, INSECURE_PLACE, AWAY_FROM_ADDR_30_DAYS_IN_YR } = require('../../../mocks/cdo/domain')
const { Dog } = require('../../../../app/data/domain')
const { buildDogDao, buildDogBreachDao } = require('../../../mocks/cdo/get')
const { Op } = require('sequelize')
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
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
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

  const sequelize = require('../../../../app/config/db')

  const { getBreachCategories, setBreaches, getBreachCategoryDAOs } = require('../../../../app/repos/breaches')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getBreachCategoryDAOs', () => {
    test('should get all breach categories by default', async () => {
      const expectedBreachCategoryDaos = [
        {
          id: 1,
          label: 'dog not covered by third party insurance',
          short_name: 'NOT_COVERED_BY_INSURANCE',
          user_selectable: true
        },
        {
          id: 2,
          label: 'dog not kept on lead or muzzled',
          short_name: 'NOT_ON_LEAD_OR_MUZZLED',
          user_selectable: true
        },
        {
          id: 11,
          label: 'dog insurance expired',
          short_name: 'INSURANCE_EXPIRED',
          user_selectable: false
        }
      ]
      sequelize.models.breach_category.findAll.mockResolvedValue(expectedBreachCategoryDaos)
      const breachCategoryDaos = await getBreachCategoryDAOs()
      expect(breachCategoryDaos).toEqual(expectedBreachCategoryDaos)
      expect(sequelize.models.breach_category.findAll).not.toHaveBeenCalledWith(expect.objectContaining({
        where: {
          user_selectable: {
            [Op.is]: true
          }
        }
      }))
    })

    test('should not get all breach categories given userSelectableOnly=true', async () => {
      const expectedBreachCategoryDaos = [
        {
          id: 1,
          label: 'dog not covered by third party insurance',
          short_name: 'NOT_COVERED_BY_INSURANCE',
          user_selectable: true
        },
        {
          id: 2,
          label: 'dog not kept on lead or muzzled',
          short_name: 'NOT_ON_LEAD_OR_MUZZLED',
          user_selectable: true
        }
      ]
      sequelize.models.breach_category.findAll.mockResolvedValue(expectedBreachCategoryDaos)
      const breachCategoryDaos = await getBreachCategoryDAOs(true)
      expect(breachCategoryDaos).toEqual(expectedBreachCategoryDaos)
      expect(sequelize.models.breach_category.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          user_selectable: {
            [Op.is]: true
          }
        }
      }))
    })
  })
  describe('getBreachCategories', () => {
    test('getBreachCategories should return breaches', async () => {
      sequelize.models.breach_category.findAll.mockResolvedValue(mockBreachCategories)

      const res = await getBreachCategories()

      expect(res).toEqual(mockBreachCategories)
      expect(sequelize.models.breach_category.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {}
      }))
    })

    test('getBreachCategories should return only userSelectable breaches given userSelectableOnly=true', async () => {
      sequelize.models.breach_category.findAll.mockResolvedValue(mockBreachCategories)

      await getBreachCategories(true)

      expect(sequelize.models.breach_category.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          user_selectable: {
            [Op.is]: true
          }
        }
      }))
    })
  })

  describe('setBreaches', () => {
    test('should start a transaction if none exists', async () => {
      const dogDao = buildDogDao()
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog())
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_ADDR_30_DAYS_IN_YR'
      ], allBreaches, callback)

      await setBreaches(dog, dogDao)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })
    test('should set breaches given none exist', async () => {
      const dogDao = buildDogDao()
      const callback = jest.fn()
      const dog = new Dog(buildCdoDog())
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_ADDR_30_DAYS_IN_YR'
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
          AWAY_FROM_ADDR_30_DAYS_IN_YR
        ]
      }))
      dog.setBreaches([
        'NOT_ON_LEAD_OR_MUZZLED',
        'AWAY_FROM_ADDR_30_DAYS_IN_YR'
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
