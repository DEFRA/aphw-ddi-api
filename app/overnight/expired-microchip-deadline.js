const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindAll } = require('../lib/db-functions')

const setExpiredMicrochipDeadlineToInBreach = async (today, user, t) => {
  try {
    const setToBreach = await dbFindAll(sequelize.models.registration, {
      where: {
        microchip_deadline: {
          [Op.lt]: today
        },
        microchip_verification: {
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

    for (const toUpdate of setToBreach) {
      console.log(`Updating dog ${toUpdate.dog.index_number} to In breach`)
      await updateStatusOnly(toUpdate.dog, statuses.InBreach, user, t)
    }
    return `Success Microchip Expiry - updated ${setToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Microchip Expiry:', e)
    throw new Error(`Error auto-updating statuses when Microchip Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredMicrochipDeadlineToInBreach
}
