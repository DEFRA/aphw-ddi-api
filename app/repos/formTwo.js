const sequelize = require('../config/db')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { NotFoundError } = require('../errors/not-found')
const { createAuditsForFormTwo } = require('../lib/email-helper')

/**
 * @typedef SubmitFormTwoMethod
 * @param {string} indexNumber
 * @param {CdoTaskList} cdoTaskList
 * @param {{
 *     microchipVerification: string;
 *     neuteringConfirmation: string;
 *     microchipNumber: string;
 *     microchipDeadline: string;
 *     dogNotNeutered: boolean;
 *     dogNotFitForMicrochip: boolean;
 * }} payload
 * @param {string} username
 * @param {() => any} callbackFn
 * @param [transaction]
 * @return {Promise<void>}
 */
/**
 * @param {string} indexNumber
 * @param {CdoTaskList} cdoTaskList
 * @param {{
 *     microchipVerification: string;
 *     neuteringConfirmation: string;
 *     microchipNumber: string;
 *     microchipDeadline: string;
 *     dogNotNeutered: boolean;
 *     dogNotFitForMicrochip: boolean;
 * }} payload
 * @param {string} username
 * @param {() => any} callbackFn
 * @param [transaction]
 */
const submitFormTwo = async (indexNumber, cdoTaskList, payload, { username }, callbackFn, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => submitFormTwo(indexNumber, cdoTaskList, payload, { username }, callbackFn, t))
  }

  const dogId = parseInt(indexNumber.replace('ED', ''))

  const formTwo = await sequelize.models.form_two.findOne({
    include: [{
      model: sequelize.models.registration,
      as: 'registration'
    }],
    where: { '$registration.dog_id$': dogId },
    transaction
  })

  if (formTwo) {
    throw new DuplicateResourceError('Form Two already submitted')
  }

  const registration = await sequelize.models.registration.findOne({
    where: { dog_id: dogId },
    transaction
  })
  if (!registration) {
    throw new NotFoundError('Cdo not found')
  }

  const userAccount = await sequelize.models.user_account.findOne({
    include: [{
      model: sequelize.models.police_force,
      as: 'police_force'
    }],
    where: { username },
    transaction
  })
  if (!userAccount) {
    throw new NotFoundError('User account not found')
  }

  await sequelize.models.form_two.create({
    registration_id: registration.id,
    form_two_submitted: new Date(),
    submitted_by: username
  }, { transaction })

  await createAuditsForFormTwo({
    indexNumber,
    microchipVerification: payload.microchipVerification,
    neuteringConfirmation: payload.neuteringConfirmation,
    microchipNumber: payload.microchipNumber,
    microchipDeadline: payload.microchipDeadline,
    policeForce: userAccount.police_force?.name,
    dogNotNeutered: payload.dogNotNeutered,
    dogNotFitForMicrochip: payload.dogNotFitForMicrochip,
    username
  })
  await callbackFn()
}

module.exports = {
  submitFormTwo
}
