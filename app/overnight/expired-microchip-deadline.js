const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll, dbFindOne } = require('../lib/db-functions')
const { registrationRelationship } = require('./overnight-relationships')
const ServiceProvider = require('../service/config')

const findExpired = async (currentStatus, today, t) => {
  return await dbFindAll(sequelize.models.registration, {
    where: {
      microchip_deadline: {
        [Op.lt]: today
      },
      microchip_verification: {
        [Op.eq]: null
      },
      '$dog.status.status$': currentStatus,
      '$exemption_order.exemption_order$': '2015'
    },
    include: registrationRelationship(sequelize),
    transaction: t
  })
}

const setExpiredMicrochipDeadlineToInBreach = async (today, user, t) => {
  try {
    const setStatusToBreach = await findExpired(statuses.Exempt, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdateStatus of setStatusToBreach) {
      console.log(`Updating dog ${toUpdateStatus.dog.index_number} to In breach`)
      await dogService.setBreach(toUpdateStatus.dog, [breachReasons.MICROCHIP_DEADLINE_EXCEEDED], user, t)
    }

    return `Success Microchip Expiry - updated ${setStatusToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Microchip Expiry:', e)
    throw new Error(`Error auto-updating statuses when Microchip Expiry: ${e}`)
  }
}

const alreadyExpiredDeadline = (dog, expiredDeadlineId) => {
  return dog?.dog_breaches?.some(breach => breach.breach_category_id === expiredDeadlineId)
}

const addBreachReasonToExpiredMicrochipDeadline = async (today, user, t) => {
  let rowsChangedCount = 0
  try {
    const breachCategory = await dbFindOne(sequelize.models.breach_category, {
      where: {
        short_name: breachReasons.MICROCHIP_DEADLINE_EXCEEDED
      }
    })

    const addBreachReason = await findExpired(statuses.InBreach, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdate of addBreachReason) {
      if (alreadyExpiredDeadline(toUpdate.dog, breachCategory.id)) {
        continue
      }
      console.log(`Updating dog ${toUpdate.dog.index_number} adding breach reason expired microchip deadline`)
      const currentBreaches = toUpdate.dog.dog_breaches.map((breach) => breach.breach_category.short_name)
      currentBreaches.push(breachReasons.MICROCHIP_DEADLINE_EXCEEDED)
      await dogService.setBreaches(toUpdate.dog.index_number, currentBreaches, user, t)
      rowsChangedCount++
    }
    return `Success Microchip Expiry add breach reason - updated ${rowsChangedCount} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Microchip Expiry add breach reason:', e)
    throw new Error(`Error auto-updating statuses when Microchip Expiry add breach reason: ${e}`)
  }
}

module.exports = {
  setExpiredMicrochipDeadlineToInBreach,
  addBreachReasonToExpiredMicrochipDeadline
}
