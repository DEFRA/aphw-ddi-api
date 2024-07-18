const sequelize = require('../config/db')
const { BreachCategory } = require('../data/domain/breachCategory')

/**
 * @typedef BreachCategoryDao
 * @property {number} id
 * @property {string} label
 * @property {string} short_name
 */
/**
 *
 * @return {Promise<BreachCategoryDao[]>}
 */
const getBreachCategoryDAOs = async () => {
  return sequelize.models.breach_category.findAll({
    order: [sequelize.col('id')]
  })
}

const getBreachCategories = async () => {
  const breachCategoryDaos = await getBreachCategoryDAOs()
  return breachCategoryDaos.map(breachCategory => new BreachCategory(breachCategory))
}

module.exports = {
  getBreachCategoryDAOs,
  getBreachCategories
}
