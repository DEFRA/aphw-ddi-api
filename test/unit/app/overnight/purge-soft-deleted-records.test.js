const user = {
  username: 'overnight-job-system-user',
  displayname: 'Overnight Job System User'
}

describe('purge-soft-deleted-records', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      dog: {
        findByPk: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn()
      },
      person: {
        findAll: jest.fn(),
        destroy: jest.fn()
      },
      registration: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
      },
      registered_person: {
        create: jest.fn(),
        findOne: jest.fn()
      },
      microchip: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn()
      },
      dog_microchip: {
        findAll: jest.fn(),
        create: jest.fn()
      },
      status: {
        findAll: jest.fn()
      },
      search_index: {
        findAll: jest.fn(),
        save: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn(),
    literal: jest.fn()
  }))
  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')

  jest.mock('../../../../app/repos/dogs')
  const { purgeDogByIndexNumber } = require('../../../../app/repos/dogs')

  describe('purgeSoftDeletedRecords', () => {
    test('should purge soft deleted records', async () => {
      sequelize.models.person.findAll.mockResolvedValue([{
        person_reference: 'P-1234-56'
      }])
      sequelize.models.dog.findAll.mockResolvedValue([{
        index_number: 'ED300002'
      }])
      const result = await purgeSoftDeletedRecords(new Date('2024-06-17T00:00:00.000Z'))
      expect(sequelize.models.person.findAll).toHaveBeenCalledWith({
        where: {
          deleted_at: {
            [Op.lte]: new Date('2024-03-19T00:00:00.000Z')
          }
        },
        paranoid: false
      })
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        where: {
          deleted_at: {
            [Op.lte]: new Date('2024-03-19T00:00:00.000Z')
          }
        },
        paranoid: false
      })
      expect(purgeDogByIndexNumber).toHaveBeenCalledWith('ED300002', user)
      expect(purgeDogByIndexNumber).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        count: {
          success: {
            dogs: 1,
            owners: 1,
            total: 2
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: ['ED300002'],
            owners: ['P-1234-56']
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      })
    })
  })
})
