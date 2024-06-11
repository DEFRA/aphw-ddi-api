const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindAll } = require('../lib/db-functions')

// 31/12/2024 deadline - keep as is
// 30/06/2024 deadline - expire on 27/07/2024
const setExpiredNeuteringDeadlineToInBreach = async (today, user, t) => {
  try {
    const isAfterJuneDeadline = today >= new Date('2024-07-27')
    const isAfterDecDeadline = today >= new Date('2025-01-01')
    const setStatusToBreach = await dbFindAll(sequelize.models.registration, {
      where: {
        neutering_deadline: {
          [Op.or]: {
            [Op.and]: {
              [Op.eq]: '2024-06-30',
              [Op.is]: isAfterJuneDeadline
            },
            [Op.and]: {
              [Op.eq]: '2024-12-31',
              [Op.is]: isAfterDecDeadline
            }
          }
        },
        neutering_confirmation: {
          [Op.eq]: null
        },
        '$dog.status.status$': statuses.Exempt
      },
      include: [{
        model: sequelize.models.dog,
        as: 'dog',
        include: [{
          model: sequelize.models.status,
          as: 'status'
        }]
      },
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      }],
      transaction: t
    })

    for (const toUpdateStatus of setStatusToBreach) {
      console.log(`Updating dog ${toUpdateStatus.dog.index_number} to In breach`)
      await updateStatusOnly(toUpdateStatus.dog, statuses.InBreach, user, t)
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
