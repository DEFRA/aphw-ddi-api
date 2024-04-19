const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses } = require('../constants/statuses')
const { updateStatusOnly } = require('../repos/status')
const { dbFindOne, dbFindAll } = require('../lib/db-functions')

const bulkUpdateOutOfBreach = async (today, user, t) => {
  try {
    const hasAlreadyRun = await dbFindOne(sequelize.models.regular_job, {
      where: {
        result: {
          [Op.iLike]: '%Success Bulk Update From Breach%'
        }
      }
    })

    if (hasAlreadyRun) {
      return 'Skipped Bulk Update From Breach'
    }

    const setToExempt = await dbFindAll(sequelize.models.registration, {
      where: {
        '$dog.status.status$': statuses.InBreach,
        '$dog.dog_breed.breed$': 'XL Bully'
      },
      include: [{
        model: sequelize.models.dog,
        as: 'dog',
        include: [{
          model: sequelize.models.status,
          as: 'status'
        },
        {
          model: sequelize.models.dog_breed,
          as: 'dog_breed'
        }]
      },
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      }],
      transaction: t
    })

    for (const toUpdate of setToExempt) {
      console.log(`Updating dog ${toUpdate.dog.index_number} to Exempt`)
      await updateStatusOnly(toUpdate.dog, statuses.Exempt, user, t)
    }
    return `Success Bulk Update From Breach - updated ${setToExempt.length} rows`
  } catch (e) {
    console.log(`Error auto-updating statuses when Bulk Update From Breach: ${e} ${e.stack}`)
    throw new Error(`Error auto-updating statuses when Bulk Update From Breach: ${e}`)
  }
}

module.exports = {
  bulkUpdateOutOfBreach
}
