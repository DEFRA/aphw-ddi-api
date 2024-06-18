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

  jest.mock('../../../../app/repos/people')
  const { purgePersonByReferenceNumber } = require('../../../../app/repos/people')

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
      expect(purgePersonByReferenceNumber).toHaveBeenCalledWith('P-1234-56', user)
      expect(purgePersonByReferenceNumber).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        count: {
          success: expect.objectContaining({
            dogs: 1,
            owners: 1,
            total: 2
          }),
          failed: expect.objectContaining({
            dogs: 0,
            owners: 0,
            total: 0
          })
        },
        deleted: {
          success: expect.objectContaining({
            dogs: ['ED300002'],
            owners: ['P-1234-56']
          }),
          failed: expect.objectContaining({
            dogs: [],
            owners: []
          })
        },
        toString: expect.any(Function)
      })

      expect('' + result).toBe('Purge deleted records. Success: 1 Dogs 1 Owners - [ED300002, P-1234-56]. Failed: 0 Dogs 0 Owners - [].')
    })

    test('should safely handle failures', async () => {
      sequelize.models.person.findAll.mockRejectedValue(new Error('server error'))
      const result = await purgeSoftDeletedRecords()
      expect('' + result).toEqual('Error purging soft deleted records: Error: server error')
    })
  })
})
