const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindAll } = require('../lib/db-functions')

const setExpiredInsuranceToBreach = async (today, t) => {
  try {
    const setToBreach = await dbFindAll(sequelize.models.registration, {
      where: {
        certificate_issued: {
          [Op.ne]: null
        },
        '$dog.status.status$': statuses.Exempt,
        '$dog.insurance.renewal_date$': {
          [Op.lt]: today
        }
      },
      include: [{
        model: sequelize.models.dog,
        as: 'dog',
        include: [{
          model: sequelize.models.status,
          as: 'status'
        },
        {
          model: sequelize.models.insurance,
          as: 'insurance'
        }]
      }],
      transaction: t
    })

    for (const toUpdate of setToBreach) {
      console.log(`Updating dog ${toUpdate.dog.index_number} to In breach`)
      await updateStatusOnly(toUpdate.dog, statuses.InBreach, t)
    }
    return `Success Insurance Expiry - updated ${setToBreach.length} rows`
  } catch (e) {
    console.log(`Error auto-updating statuses when Insurance Expiry: ${e} ${e.stack}`)
    throw new Error(`Error auto-updating statuses when Insurance Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredInsuranceToBreach
}
