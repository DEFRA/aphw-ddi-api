const sequelize = require('../config/db')
const { BreachCategory } = require('../data/domain')

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
/**
 * @param {import('../data/domain/dog')} dog
 * @param dogDao
 * @param [transaction]
 * @return {Promise<void>}
 */
const setBreaches = async (dog, dogDao, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => setBreaches(dog, t))
  }
  const dogId = dog.id

  for (const dogBreach of dogDao.dog_breaches) {
    await dogBreach.destroy({ force: true, transaction })
  }

  const dogBreaches = dog.breaches.map(breach => ({
    dog_id: dogId,
    breach_category_id: breach.id
  }))

  await sequelize.models.dog_breach.bulkCreate(dogBreaches, { transaction })
}

module.exports = {
  getBreachCategoryDAOs,
  getBreachCategories,
  setBreaches
}
