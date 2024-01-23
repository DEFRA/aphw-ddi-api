const { createCdo } = require('../../repos/cdo')
const sequelize = require('../../config/db')
const { addYears } = require('date-fns')
const { calculateNeuteringDeadline } = require('../../dto/dto-helper')

const processRegister = async (register) => {
  await sequelize.transaction(async (t) => {
    for (const record of register.add) {
      const owner = record.owner

      owner.phoneNumber = `${owner.phoneNumber}`.startsWith('0') ? `${owner.phoneNumber}` : `0${owner.phoneNumber}`

      const data = {
        owner: {
          ...owner,
          primaryTelephone: owner.phoneNumber
        },
        dogs: record.dogs.map(d => ({
          ...d,
          source: 'ROBOT',
          breed: 'XL Bully',
          status: 'Exempt',
          sex: d.gender,
          colour: d.colour,
          microchipDeadline: new Date(2024, 2, 31),
          neuteringDeadline: calculateNeuteringDeadline(d.birthDate),
          applicationFeePaid: d.certificateIssued,
          insurance: {
            company: 'Dogs Trust',
            renewalDate: addYears(d.insuranceStartDate, 1)
          }
        })),
        enforcementDetails: {
          cdoIssued: null,
          cdoExpiry: null,
          policeForce: owner.policeForceId
        }
      }

      await createCdo(data, 'robot-import-system-user', t)
    }
  })
}

module.exports = {
  processRegister
}
