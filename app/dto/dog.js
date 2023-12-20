const { getMicrochip } = require('./dto-helper')

const dogDto = (data) => ({
  id: data.id,
  indexNumber: data.index_number,
  name: data.name,
  breed: data.dog_breed.breed,
  colour: data.colour,
  sex: data.sex,
  dateOfBirth: data.birth_date,
  dateOfDeath: data.death_date,
  tattoo: data.tattoo,
  microchipNumber: getMicrochip(data, 1),
  microchipNumber2: getMicrochip(data, 2),
  dateExported: data.exported_date,
  dateStolen: data.stolen_date
})

module.exports = {
  dogDto
}
