const sequelize = require('../config/db')

/**
 * @typedef BreachCategory
 * @property {number} id
 * @property {string} label
 * @property {string} short_name
 */
/**
 *
 * @return {Promise<BreachCategory[]>}
 */
const getBreachCategories = async () => {
  return sequelize.models.breach_category.findAll()
}

module.exports = {
  getBreachCategories
}
