const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { Op } = require('sequelize')

const microchipExists = async (dogId, microchipNumber, transaction) => {
  const microchip = await sequelize.models.microchip.findOne({
    include: [{
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      where: {
        dog_id: {
          [Op.not]: dogId
        }
      }
    }],
    where: {
      microchip_number: microchipNumber
    },
    transaction
  })

  return microchip?.microchip_number ?? null
}

const throwForDuplicates = async (payload, dogId, transaction) => {
  const duplicateMicrochips = []
  const microchipsToCheck = [payload.microchipNumber, payload.microchipNumber2].filter(mC => !!mC)

  for (const microchipNumber of microchipsToCheck) {
    const duplicateMicrochip = await microchipExists(dogId, microchipNumber, transaction)
    if (duplicateMicrochip !== null) {
      duplicateMicrochips.push(duplicateMicrochip)
    }
  }

  if (duplicateMicrochips.length) {
    throw new DuplicateResourceError('The microchip number already exists', { microchipNumbers: duplicateMicrochips })
  }
}

const updateMicrochips = async (dogFromDb, payload, transaction) => {
  await throwForDuplicates(payload, dogFromDb.id, transaction)

  await updateMicrochip(dogFromDb, payload.microchipNumber, 1, transaction)
  await updateMicrochip(dogFromDb, payload.microchipNumber2, 2, transaction)
}

const updateMicrochip = async (dogFromDb, newMicrochipNumber, position, transaction) => {
  const existingMicrochip = await getMicrochipDetails(dogFromDb.id, position)
  if (existingMicrochip?.microchip_number !== newMicrochipNumber) {
    if (existingMicrochip) {
      existingMicrochip.microchip_number = newMicrochipNumber
      await existingMicrochip.save({ transaction })
    } else if (newMicrochipNumber) {
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
  updateMicrochip,
  updateMicrochips,
  createMicrochip,
  microchipExists
}
