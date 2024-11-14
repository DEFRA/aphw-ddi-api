const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll, dbFindOne } = require('../lib/db-functions')
const ServiceProvider = require('../service/config')
const { registrationRelationship } = require('./overnight-relationships')

const findExpired = async (currentStatus, today, t) => {
  return await dbFindAll(sequelize.models.registration, {
    where: {
      certificate_issued: {
        [Op.ne]: null
      },
      '$dog.status.status$': currentStatus,
      '$dog.insurance.renewal_date$': {
        [Op.lt]: today
      },
      '$exemption_order.exemption_order$': '1991'
    },
    include: registrationRelationship(sequelize),
    transaction: t
  })
}

const setExpiredInsuranceToBreach = async (today, user, t) => {
  try {
    const setToBreach = await findExpired(statuses.Exempt, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdate of setToBreach) {
      console.log(`Updating dog ${toUpdate.dog.index_number} to In breach`)
      await dogService.setBreach(toUpdate.dog, [breachReasons.INSURANCE_EXPIRED], user, t)
    }
    return `Success Insurance Expiry to Breach - updated ${setToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Insurance Expiry to Breach:', e)
    throw new Error(`Error auto-updating statuses when Insurance Expiry to Breach: ${e}`)
  }
}

const alreadyExpiredInsurance = (dog, expiredInsuranceId) => {
  return dog?.dog_breaches?.some(breach => breach.breach_category_id === expiredInsuranceId)
}

const addBreachReasonToExpiredInsurance = async (today, user, t) => {
  let rowsChangedCount = 0
  try {
    const breachCategory = await dbFindOne(sequelize.models.breach_category, {
      where: {
        short_name: breachReasons.INSURANCE_EXPIRED
      }
    })

    const addBreachReason = await findExpired(statuses.InBreach, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdate of addBreachReason) {
      if (alreadyExpiredInsurance(toUpdate.dog, breachCategory.id)) {
        continue
      }
      console.log(`Updating dog ${toUpdate.dog.index_number} adding breach reason expired insurance`)
      const currentBreaches = toUpdate.dog.dog_breaches.map((breach) => breach.breach_category.short_name)
      currentBreaches.push(breachReasons.INSURANCE_EXPIRED)
      await dogService.setBreaches(toUpdate.dog.index_number, currentBreaches, user, t)
      rowsChangedCount++
    }
    return `Success Insurance Expiry add breach reason - updated ${rowsChangedCount} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Insurance Expiry add breach reason:', e)
    throw new Error(`Error auto-updating statuses when Insurance Expiry add breach reason: ${e}`)
  }
}

module.exports = {
  setExpiredInsuranceToBreach,
  addBreachReasonToExpiredInsurance
}
