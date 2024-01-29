const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindAll } = require('../lib/db-functions')

const setExpiredNeuteringDeadlineToInBreach = async (today, t) => {
  try {
    const setStatusToBreach = await dbFindAll(sequelize.models.registration, {
      where: {
        neutering_deadline: {
          [Op.lt]: today
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
      await updateStatusOnly(toUpdateStatus.dog, statuses.InBreach, t)
    }
    return `Success Neutering Expiry - updated ${setStatusToBreach.length} rows`
  } catch (e) {
    console.log(`Error auto-updating statuses when Neutering Expiry: ${e} ${e.stack}`)
    throw new Error(`Error auto-updating statuses when Neutering Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredNeuteringDeadlineToInBreach
}
