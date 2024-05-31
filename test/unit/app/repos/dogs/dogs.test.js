const { NotFoundError } = require('../../../../../app/errors/not-found')

const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

describe('Dog repo', () => {
  jest.mock('../../../../../app/config/db', () => ({
    models: {
      dog: {
        findByPk: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn()
      },
      person: {
        findAll: jest.fn()
      },
      registration: {
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

  jest.mock('../../../../../app/repos/dogs/dog')
  const { deleteDogByIndexNumber } = require('../../../../../app/repos/dogs/dog')

  const { deleteDogs } = require('../../../../../app/repos/dogs')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('deleteDogs', () => {
    test('should successfully delete dogs', async () => {
      const personsToDelete = ['ED300001', 'ED300002']
      const response = await deleteDogs(personsToDelete, devUser)
      expect(deleteDogByIndexNumber.mock.calls[0]).toEqual(['ED300001', devUser])
      expect(deleteDogByIndexNumber.mock.calls[1]).toEqual(['ED300002', devUser])

      expect(response).toEqual({
        count: {
          failed: 0,
          success: 2
        },
        deleted: {
          failed: [],
          success: ['ED300001', 'ED300002']
        }
      })
    })

    test('should handle delete failures', async () => {
      deleteDogByIndexNumber.mockRejectedValueOnce(new NotFoundError('Person does not exist'))
      const dogsToDelete = ['ED300001', 'ED300002']
      const response = await deleteDogs(dogsToDelete, devUser)

      expect(response).toEqual({
        count: {
          failed: 1,
          success: 1
        },
        deleted: {
          failed: ['ED300001'],
          success: ['ED300002']
        }
      })
    })
  })
})
