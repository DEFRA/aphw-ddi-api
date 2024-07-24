const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll } = require('../lib/db-functions')
const ServiceProvider = require('../service/config')

const setExpiredNeuteringDeadlineToInBreach = async (today, user, t) => {
  try {
    // Rule-part turned off temporarily
    // const isAfterJuneDeadline = today >= new Date('2024-07-27')
    // fake June deadline
    const isAfterJuneDeadline = today >= new Date('2024-07-25')
    // const isAfterJuneDeadline = false
    const isAfterDecDeadline = today >= new Date('2025-01-01')

    const setStatusToBreach = await dbFindAll(sequelize.models.registration, {
      where: {
        [Op.or]: [{
          [Op.and]: [
            {
              neutering_deadline: {
                [Op.eq]: new Date('2024-06-30')
              }
            },
            isAfterJuneDeadline ? sequelize.literal('1 = 1') : sequelize.literal('1 = 0')
          ]
        },
        {
          [Op.and]: [
            {
              neutering_deadline: {
                [Op.eq]: new Date('2024-12-31')
              }
            },
            isAfterDecDeadline ? sequelize.literal('1 = 1') : sequelize.literal('1 = 0')
          ]
        }],
        neutering_confirmation: {
          [Op.eq]: null
        },
        '$dog.status.status$': statuses.Exempt
      },
      include: [{
        model: sequelize.models.dog,
        as: 'dog',
        include: [
          {
            model: sequelize.models.status,
            as: 'status'
          },
          {
            model: sequelize.models.dog_breach,
            as: 'dog_breaches'
          }
        ]
      },
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      }],
      transaction: t
    })

    const dogService = ServiceProvider.getDogService()

    for (const toUpdateStatus of setStatusToBreach) {
      console.log(`Updating dog ${toUpdateStatus.dog.index_number} to In breach`)
      await dogService.setBreach(toUpdateStatus.dog, [breachReasons.NEUTERING_DEADLINE_EXCEEDED], user, t)
    }

    return `Success Neutering Expiry - updated ${setStatusToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Neutering Expiry:', e)
    throw new Error(`Error auto-updating statuses when Neutering Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredNeuteringDeadlineToInBreach
}
