// const sequelize = require('../config/db')

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
  return []
  // return await sequelize.models.country.findAll({
  //   attributes: ['country']
  // })
}

module.exports = {
  getBreachCategories
}
