const sequelize = require('../config/db')

/**
 * @param {number} [count]
 * @returns {Promise<Model<any, TModelAttributes>[]>}
 */
const getComments = async (count) => {
  try {
    /**
     * @type {{ limit?: number; include: any[] }}
     */
    const options = {
      include: [
        {
          model: sequelize.models.registration,
          as: 'registration',
          include: [
            {
              model: sequelize.models.dog,
              as: 'dog'
            }
          ]
        }
      ]
    }

    if (count) {
      options.limit = count
    }

    const comments = await sequelize.models.comment.findAll({
      attributes: ['id', 'registration_id', 'comment'],
      ...options
    })

    return comments
  } catch (e) {
    console.log('Error retrieving comments:', e)
    throw e
  }
}

const removeComment = async (commentId) => {
  await sequelize.models.comment.destroy({
    where: {
      id: commentId
    }
  })
}

module.exports = {
  getComments,
  removeComment
}
