describe('OnwerSearch test', () => {
  jest.mock('../../../../../app/config/db', () => ({
    models: {
      person: {
        findAll: jest.fn()
      }
    },
    col: jest.fn(),
    fn: jest.fn(),
    where: jest.fn()
  }))

  const sequelize = require('../../../../../app/config/db')

  const { ownerSearch } = require('../../../../../app/import/robot/owner-search')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('ownerSearch', () => {
    test('should call findAll and return first result', async () => {
      sequelize.models.person.findAll.mockResolvedValue([{ person_reference: 'P-123' }, { person_reference: 'P-456' }])

      const criteria = {
        firstName: 'first',
        lastName: 'last',
        birthDate: new Date(2000, 1, 1)
      }

      const res = await ownerSearch(criteria)

      expect(sequelize.models.person.findAll).toHaveBeenCalledTimes(1)
      expect(res).toBe('P-123')
    })

    test('should return null', async () => {
      sequelize.models.person.findAll.mockResolvedValue([])

      const criteria = {
        firstName: 'first',
        lastName: 'last',
        birthDate: new Date(2000, 1, 1)
      }

      const res = await ownerSearch(criteria)

      expect(sequelize.models.person.findAll).toHaveBeenCalledTimes(1)
      expect(res).toBe(null)
    })
  })
})
