const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll, dbFindOne } = require('../lib/db-functions')
const { updateStatusOnly } = require('../repos/status')
const { removeBreachReasonFromDog } = require('../repos/breaches')

const findExpired = async (currentStatus, t) => {
  return await dbFindAll(sequelize.models.registration, {
    where: {
      certificate_issued: {
        [Op.ne]: null
      },
      '$dog.status.status$': currentStatus,
      '$exemption_order.exemption_order$': '2023'
    },
    include: [
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      },
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
}

const moreThanJustExpiredInsurance = (dog, expiredInsuranceId) => {
  return !(dog?.dog_breaches?.some(breach => breach.breach_category_id === expiredInsuranceId) && dog?.dog_breaches?.length === 1)
}

const revertExpiredInsurance = async (_today, user, t) => {
  try {
    const breachCategory = await dbFindOne(sequelize.models.breach_category, {
      where: {
        short_name: breachReasons.INSURANCE_EXPIRED
      }
    })

    const inBreachRows = await findExpired(statuses.InBreach, t)

    let rowsChangedCount = 0

    for (const inBreach of inBreachRows) {
      if (moreThanJustExpiredInsurance(inBreach.dog, breachCategory.id)) {
        // Remove insurance breach reason but leave others
        console.log(`Updating dog ${inBreach.dog.index_number} removing a breach reason`)
        await removeBreachReasonFromDog(inBreach.dog.id, breachCategory.id, t)
        rowsChangedCount++
      } else {
        console.log(`Updating dog ${inBreach.dog.index_number} back to Exempt`)
        await updateStatusOnly(inBreach.dog, statuses.Exempt, user, t)
        rowsChangedCount++
      }
    }
    return `Success Revert In-breach Insurance to Exempt - updated ${rowsChangedCount} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Revert In-breach Insurance to Exempt:', e)
    throw new Error(`Error auto-updating statuses when Revert In-breach Insurance to Exempt: ${e}`)
  }
}

module.exports = {
  revertExpiredInsurance,
  moreThanJustExpiredInsurance
}
