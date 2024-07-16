/**
 * @type {BreachCategory[]}
 */
const mockBreachCategories = [
  {
    id: 1,
    label: 'Dog not covered by third party insurance',
    short_name: 'NOT_COVERED_BY_INSURANCE'
  },
  {
    id: 2,
    label: 'Dog not kept on lead or muzzled',
    short_name: 'NOT_ON_LEAD_OR_MUZZLED'
  },
  {
    id: 3,
    label: 'Dog kept in insecure place',
    short_name: 'INSECURE_PLACE'
  }
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

  test('getCountries should return countries', async () => {
    sequelize.models.breach_category.findAll.mockResolvedValue(mockBreachCategories)

    const res = await getBreachCategories()

    expect(res).toEqual(mockBreachCategories)
  })
})
