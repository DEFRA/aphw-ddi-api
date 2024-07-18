const { BreachCategory } = require('../../../../app/data/domain/breachCategory')
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
    models: {
      breach_category: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getBreachCategories } = require('../../../../app/repos/breaches')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getBreachCategories should return breaches', async () => {
    sequelize.models.breach_category.findAll.mockResolvedValue(mockBreachCategories)

    const res = await getBreachCategories()

    expect(res).toEqual(mockBreachCategories)
  })
})
