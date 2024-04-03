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
      expect(comments).toEqual(mockComments)
      expect(sequelize.models.comment.findAll).toBeCalledWith({ attributes: ['id', 'registration_id', 'comment'], include: expect.anything() })
    })

    test('getComments should limit', async () => {
      sequelize.models.comment.findAll.mockResolvedValue([mockComments[0]])

      const comments = await getComments(1)

      expect(comments).toHaveLength(1)
      expect(comments).toEqual([expect.objectContaining({
        id: 2124,
        registration_id: 2631,
        comment: 'Ratione voluptatibus officiis totam cupiditate hic. Consequatur tempore rem qui aperiam ratione. Iure cupiditate blanditiis eos ea odio eius.',
        registration: expect.objectContaining({
          cdo_issued: '2016-07-20',
          dog: expect.objectContaining({
            index_number: 'ED27995'
          })
        })
      })])
      expect(sequelize.models.comment.findAll).toBeCalledWith({ limit: 1, attributes: expect.anything(), include: expect.anything() })
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
