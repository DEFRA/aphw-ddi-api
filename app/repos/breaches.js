const sequelize = require('../config/db')
const { BreachCategory } = require('../data/domain')
const { Op } = require('sequelize')

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
const getBreachCategoryDAOs = async (userSelectableOnly = false) => {
  const where = userSelectableOnly
    ? {
        user_selectable: {
          [Op.is]: true
        }
      }
    : {}

  return sequelize.models.breach_category.findAll({
    order: [sequelize.col('id')],
    where
  })
}

/**
 * @param {boolean} userSelectableOnly
 * @return {Promise<BreachCategory[]>}
 */
const getBreachCategories = async (userSelectableOnly = false) => {
  const breachCategoryDaos = await getBreachCategoryDAOs(userSelectableOnly)
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
    return await sequelize.transaction(async (t) => setBreaches(dog, dogDao, t))
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

/**
 * @param {import('../data/domain/dog')} dog
 * @param dogDao
 * @param [transaction]
 * @return {Promise<void>}
 */
const removeBreachReasonFromDog = async (dog, breachCategoryId, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => removeBreachReasonFromDog(dog, breachCategoryId, t))
  }
  const dogBreach = await sequelize.models.dog_breach.findOne({
    where: {
      dog_id: dog.id,
      breach_category_id: breachCategoryId
    },
    transaction
  })

  if (dogBreach?.id) {
    await dogBreach.destroy({ force: true, transaction })
  }
}

module.exports = {
  getBreachCategoryDAOs,
  getBreachCategories,
  setBreaches,
  removeBreachReasonFromDog
}
