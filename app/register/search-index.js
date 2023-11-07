const sequelize = require('../config/db')
const { Op } = require('sequelize')

const search = async (query) => {
  const result = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', query)
      }
    }
  })

  return result
}

module.exports = {
  search
}
