const { BreachCategory } = require('../../data/domain')
/**
 * @param {DogBreachDao} dogBreachDao
 * @return {BreachCategory}
 */
const mapDogBreachDaoToBreachCategory = (dogBreachDao) => {
  return new BreachCategory({
    id: dogBreachDao.breach_category.id,
    label: dogBreachDao.breach_category.label,
    short_name: dogBreachDao.breach_category.short_name
  })
}

module.exports = { mapDogBreachDaoToBreachCategory }
