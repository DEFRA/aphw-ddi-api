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

/**
 * @param {DogBreachDao} dogBreachDao
 * @return {BreachDto}
 */
const mapDogBreachDaoToBreachDto = (dogBreachDao) => dogBreachDao.breach_category.label

/**
 * @param {BreachCategory} breachCategory
 * @return {BreachDto}
 */
const mapBreachCategoryToBreachDto = (breachCategory) => breachCategory.label

/**
 * @param {Dog} dog
 * @return {DogDto}
 */
const mapDogToDogDto = (dog) => {
  return {
    id: dog.id,
    indexNumber: dog.indexNumber,
    name: dog.name,
    breed: dog.breed,
    colour: dog.colour,
    sex: dog.sex,
    dateOfBirth: dog.dateOfBirth,
    dateOfDeath: dog.dateOfDeath,
    tattoo: dog.tattoo,
    microchipNumber: dog.microchipNumber,
    microchipNumber2: dog.microchipNumber2,
    dateExported: dog.dateExported,
    dateStolen: dog.dateStolen,
    dateUntraceable: dog.dateUntraceable,
    breaches: dog.breaches.map(mapBreachCategoryToBreachDto)
  }
}

module.exports = { mapDogBreachDaoToBreachCategory, mapDogToDogDto, mapDogBreachDaoToBreachDto }
