const { comments: mockComments } = require('../../../mocks/comments')

describe('Comments repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      comment: {
        findAll: jest.fn(),
        destroy: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { getComments, removeComment } = require('../../../../app/repos/comments')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getComments', () => {
    test('getComments should return comments', async () => {
      sequelize.models.comment.findAll.mockResolvedValue(mockComments)

      const comments = await getComments()

      expect(comments).toHaveLength(3)
      expect(comments).toEqual([{
        id: 1,
        registration_id: 1,
        comment: 'Lorem ipsum dolar sit amet'
      },
      {
        id: 2,
        registration_id: 2,
        name: 'Vel Nulla mauris vel fringilla. tortor amet, Maecenas luctus. sapien'
      },
      {
        id: 3,
        registration_id: 3,
        name: 'Morbi venenatis Morbi dolor, sit dolor, Lorem libero Lorem '
      }])
      expect(sequelize.models.comment.findAll).toBeCalledWith({ attributes: ['id', 'registration_id', 'comment'] })
    })

    test('getComments should limit', async () => {
      sequelize.models.comment.findAll.mockResolvedValue([mockComments[0]])

      const comments = await getComments(1)

      expect(comments).toHaveLength(1)
      expect(comments).toEqual([{
        id: 1,
        registration_id: 1,
        comment: 'Lorem ipsum dolar sit amet'
      }])
      expect(sequelize.models.comment.findAll).toBeCalledWith({ limit: 1, attributes: ['id', 'registration_id', 'comment'] })
    })

    test('getComments should throw if error', async () => {
      sequelize.models.comment.findAll.mockRejectedValue(new Error('Test error'))

      await expect(getComments()).rejects.toThrow('Test error')
    })
  })

  describe('removeComment', () => {
    test('should remove the comment', async () => {
      await removeComment(1234)
      expect(sequelize.models.comment.destroy).toBeCalledWith({
        where: {
          id: 1234
        }
      })
    })

    test('should throw an error', async () => {
      sequelize.models.comment.destroy.mockRejectedValue(new Error('test error'))

      await expect(removeComment(1234)).rejects.toThrow('test error')
    })
  })
})
