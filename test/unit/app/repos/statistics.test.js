const { countsPerStatus: mockCountsPerStatus } = require('../../../mocks/statistics')

describe('Statistics repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      status: {
        findAll: jest.fn()
      }
    },
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  const { getCountsPerStatus, constructStatusOrderBy } = require('../../../../app/repos/statistics')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getCountsPerStatus', () => {
    test('should return counts per status', async () => {
      sequelize.models.status.findAll.mockResolvedValue(mockCountsPerStatus)

      const counts = await getCountsPerStatus()

      expect(counts).toHaveLength(7)
      expect(counts[0].total).toBe('20')
      expect(counts[0].status).toBe('Interim exempt')
      expect(counts[1].total).toBe('30')
      expect(counts[1].status).toBe('Pre-exempt')
      expect(counts[2].total).toBe('40')
      expect(counts[2].status).toBe('Failed')
      expect(counts[3].total).toBe('500')
      expect(counts[3].status).toBe('Exempt')
      expect(counts[4].total).toBe('60')
      expect(counts[4].status).toBe('In breach')
      expect(counts[5].total).toBe('70')
      expect(counts[5].status).toBe('Withdrawn')
      expect(counts[6].total).toBe('80')
      expect(counts[6].status).toBe('Inactive')
    })
  })

  describe('constructStatusOrderBy', () => {
    test('should return correct order string', async () => {
      const orderBy = await constructStatusOrderBy()

      expect(orderBy).toBe('status=\'Inactive\',status=\'Withdrawn\',status=\'In breach\',status=\'Exempt\',status=\'Failed\',status=\'Pre-exempt\',status=\'Interim exempt\'')
    })
  })
})
