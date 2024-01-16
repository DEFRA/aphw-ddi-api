const sequelize = require('../config/db')

const updateMicrochips = async (dogFromDb, payload, transaction) => {
  await updateMicrochip(dogFromDb, payload.microchipNumber, 1, transaction)
  await updateMicrochip(dogFromDb, payload.microchipNumber2, 2, transaction)
}

const updateMicrochip = async (dogFromDb, newMicrochipNumber, position, transaction) => {
  const existingMicrochip = await getMicrochipDetails(dogFromDb.id, position)
  if (newMicrochipNumber && existingMicrochip?.microchip_number !== newMicrochipNumber) {
    if (existingMicrochip) {
      existingMicrochip.microchip_number = newMicrochipNumber
      await existingMicrochip.save({ transaction })
    } else {
      await createMicrochip(newMicrochipNumber, dogFromDb.id, transaction)
    }
  }
}

const getMicrochipDetails = async (dogId, position, transaction) => {
  const microchips = await sequelize.models.microchip.findAll({
    order: [[sequelize.col('dog_microchips.id'), 'ASC']],
    include: [{
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      where: { dog_id: dogId }
    }],
    transaction
  })
  return microchips && microchips.length >= position ? microchips[position - 1] : null
}

const createMicrochip = async (microchipNumber, dogId, transaction) => {
  const microchip = {
    microchip_number: microchipNumber
  }
  const newMicrochip = await sequelize.models.microchip.create(microchip, { transaction })
  const dogMicrochip = {
    dog_id: dogId,
    microchip_id: newMicrochip.id
  }
  await sequelize.models.dog_microchip.create(dogMicrochip, { transaction })
}

module.exports = {
  updateMicrochips,
  createMicrochip
}
