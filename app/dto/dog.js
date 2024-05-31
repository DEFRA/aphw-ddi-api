const { getMicrochip } = require('./dto-helper')

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
  dateUntraceable: data.untraceable_date
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
