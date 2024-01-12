const { createCdo } = require('../../repos/cdo')
const sequelize = require('../../config/db')
const { addYears } = require('date-fns')

const processRegister = async (register) => {
  await sequelize.transaction(async (t) => {
    for (const record of register.add) {
      const owner = record.owner

      owner.phoneNumber = `0${owner.phoneNumber}`

      const data = {
        owner: {
          ...owner,
          primaryTelephone: owner.phoneNumber
        },
        dogs: record.dogs.map(d => ({
          ...d,
          source: 'Robot',
          breed: 'XL Bully',
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

      await createCdo(data, t)
    }
  })
}

module.exports = {
  processRegister
}
