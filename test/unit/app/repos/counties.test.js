const mockCounties = [
  'County1', 'County2', 'County3'
]

describe('Counties repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      county: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getCounties } = require('../../../../app/repos/counties')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getCounties should return counties', async () => {
    sequelize.models.county.findAll.mockResolvedValue(mockCounties)

    const res = await getCounties()

    expect(res).toEqual(mockCounties)
  })
})
