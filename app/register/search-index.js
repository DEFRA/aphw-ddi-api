const sequelize = require('../config/db')
const { Op } = require('sequelize')

const addToSearchIndex = async () => {
  await sequelize.models.search_index.create({
    search: sequelize.fn('to_tsvector', 'english', 'The Fat Rats')
  })
}

const search = async (query) => {
  const result = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', 'rat')
      }
    }
  })

  return result
}

module.exports = {
  addToSearchIndex,
  search
}
