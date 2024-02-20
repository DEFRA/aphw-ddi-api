const { deepClone } = require('../../lib/deep-clone')
const { getMicrochip, stripTime } = require('../dto-helper')

const preChangedDogAudit = (dogFromDb) => {
  const dog = deepClone(dogFromDb)

  const pre = {
    index_number: dog.index_number,
    dog_name: dog.name ?? '',
    breed_type: dog.dog_breed?.breed ?? null,
    colour: dog.colour ?? '',
    sex: dog.sex ?? '',
    dog_date_of_birth: stripTime(dog.birth_date) ?? null,
    dog_date_of_death: stripTime(dog.death_date) ?? null,
    tattoo: dog.tattoo ?? '',
    microchip1: getMicrochip(dog, 1),
    microchip2: getMicrochip(dog, 2),
    date_exported: stripTime(dog.exported_date) ?? null,
    date_stolen: stripTime(dog.stolen_date) ?? null,
    date_untraceable: stripTime(dog.untraceable_date) ?? null,
    status: dog.status?.status ?? null
  }

  return pre
}

const postChangedDogAudit = (dogFromDb) => {
  return preChangedDogAudit(dogFromDb)
}

module.exports = {
  preChangedDogAudit,
  postChangedDogAudit
}
