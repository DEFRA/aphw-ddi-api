const { getMicrochip } = require('./dto-helper')

/**
 *
 * @param {DogBreachDao} dogBreach
 * @return {BreachDto}
 */
const dogBreachDaoToBreachDto = (dogBreach) => dogBreach.breach_category.label
/**
 * @typedef DogDto
 * @property {number} id
 * @property {string} indexNumber
 * @property {string} name
 * @property {string|null} breed
 * @property {string|null} colour
 * @property {string|null} sex
 * @property {Date|null} dateOfBirth
 * @property {Date|null} dateOfDeath
 * @property {string|null} tattoo
 * @property {string|null|undefined} microchipNumber
 * @property {string|null|undefined} microchipNumber2
 * @property {Date|null} dateExported
 * @property {Date|null} dateStolen
 * @property {Date|null} dateUntraceable
 * @property {BreachDto[]} breaches
 */
/**
 * @param {DogDao} data
 * @return {DogDto}
 */
const dogDto = (data) => ({
  id: data.id,
  indexNumber: data.index_number,
  name: data.name,
  breed: data.dog_breed?.breed ?? data.breed,
  colour: data.colour,
  sex: data.sex,
  dateOfBirth: data.birth_date,
  dateOfDeath: data.death_date,
  tattoo: data.tattoo,
  microchipNumber: getMicrochip(data, 1),
  microchipNumber2: getMicrochip(data, 2),
  dateExported: data.exported_date,
  dateStolen: data.stolen_date,
  dateUntraceable: data.untraceable_date,
  breaches: data.dog_breaches.map(dogBreachDaoToBreachDto)
})

const oldDogDto = (data) => ({
  id: data.dog_id,
  indexNumber: data.dog.index_number,
  dateOfBirth: data.dog.birth_date,
  cdoIssued: data.cdo_issued,
  status: data.dog.status
})

module.exports = {
  dogDto,
  oldDogDto
}
