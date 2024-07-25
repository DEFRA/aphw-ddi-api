const mockCountries = [
  'Country1', 'Country2', 'Country3'
]

describe('Countries repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      country: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getCountries } = require('../../../../app/repos/countries')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getCountries should return countries', async () => {
    sequelize.models.country.findAll.mockResolvedValue(mockCountries)

    const res = await getCountries()

    expect(res).toEqual(mockCountries)
  })
})
