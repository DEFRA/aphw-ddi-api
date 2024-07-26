const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindAll } = require('../lib/db-functions')

const setExpiredCdosToFailed = async (today, user, t) => {
  try {
    const setToFailed = await dbFindAll(sequelize.models.registration, {
      where: {
        cdo_expiry: {
          [Op.lt]: today
        },
        '$dog.status.status$': statuses.PreExempt
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
            as: 'dog_breaches',
            include: [
              {
                model: sequelize.models.breach_category,
                as: 'breach_category'
              }
            ]
          }
        ]
      }],
      transaction: t
    })

    for (const toUpdate of setToFailed) {
      console.log(`Updating dog ${toUpdate.dog.index_number} to Failed`)
      await updateStatusOnly(toUpdate.dog, statuses.Failed, user, t)
    }
    return `Success CDO Expiry - updated ${setToFailed.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when CDO Expiry:', e)
    throw new Error(`Error auto-updating statuses when CDO Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredCdosToFailed
}
