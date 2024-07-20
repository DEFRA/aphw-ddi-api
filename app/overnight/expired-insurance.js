const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll } = require('../lib/db-functions')
const ServiceProvider = require('../service/config')

const setExpiredInsuranceToBreach = async (today, user, t) => {
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
      include: [
        {
          model: sequelize.models.dog,
          as: 'dog',
          include: [
            {
              model: sequelize.models.status,
              as: 'status'
            },
            {
              model: sequelize.models.insurance,
              as: 'insurance'
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
        }
      ],
      transaction: t
    })
    const dogService = ServiceProvider.getDogService()

    for (const toUpdate of setToBreach) {
      await dogService.setBreach(toUpdate.dog, [breachReasons.NOT_COVERED_BY_INSURANCE], user, t)
    }
    return `Success Insurance Expiry - updated ${setToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Insurance Expiry:', e)
    throw new Error(`Error auto-updating statuses when Insurance Expiry: ${e}`)
  }
}

module.exports = {
  setExpiredInsuranceToBreach
}
