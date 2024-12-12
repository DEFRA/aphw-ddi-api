const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll, dbFindOne } = require('../lib/db-functions')
const { addDays } = require('../lib/date-helpers')
const { registrationRelationship } = require('./overnight-relationships')
const ServiceProvider = require('../service/config')

const findExpired = async (currentStatus, today, t) => {
  const dogs2023 = await dbFindAll(sequelize.models.registration, {
    where: {
      neutering_deadline: {
        [Op.lt]: today
      },
      neutering_confirmation: {
        [Op.eq]: null
      },
      '$dog.status.status$': currentStatus,
      '$exemption_order.exemption_order$': '2023'
    },
    include: registrationRelationship(sequelize),
    transaction: t
  })

  const todayPlus28Days = addDays(today, 28)

  const dogs2015Xlbs = await dbFindAll(sequelize.models.registration, {
    where: {
      neutering_deadline: {
        [Op.lt]: todayPlus28Days
      },
      neutering_confirmation: {
        [Op.eq]: null
      },
      '$dog.status.status$': currentStatus,
      '$dog.dog_breed.breed$': 'XL Bully',
      '$exemption_order.exemption_order$': '2015'
    },
    include: registrationRelationship(sequelize),
    transaction: t
  })

  return dogs2023.concat(dogs2015Xlbs)
}

const setExpiredNeuteringDeadlineToInBreach = async (today, user, t) => {
  try {
    const setStatusToBreach = await findExpired(statuses.Exempt, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdateStatus of setStatusToBreach) {
      console.log(`Updating dog ${toUpdateStatus.dog.index_number} to In breach`)
      await dogService.setBreach(toUpdateStatus.dog, [breachReasons.NEUTERING_DEADLINE_EXCEEDED], user, t)
    }

    return `Success Neutering Expiry - updated ${setStatusToBreach.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Neutering Expiry:', e)
    throw new Error(`Error auto-updating statuses when Neutering Expiry: ${e}`)
  }
}

const alreadyExpiredDeadline = (dog, expiredDeadlineId) => {
  return dog?.dog_breaches?.some(breach => breach.breach_category_id === expiredDeadlineId)
}

const addBreachReasonToExpiredNeuteringDeadline = async (today, user, t) => {
  let rowsChangedCount = 0
  try {
    const breachCategory = await dbFindOne(sequelize.models.breach_category, {
      where: {
        short_name: breachReasons.NEUTERING_DEADLINE_EXCEEDED
      }
    })

    const addBreachReason = await findExpired(statuses.InBreach, today, t)

    const dogService = ServiceProvider.getDogService()

    for (const toUpdate of addBreachReason) {
      if (alreadyExpiredDeadline(toUpdate.dog, breachCategory.id)) {
        continue
      }
      console.log(`Updating dog ${toUpdate.dog.index_number} adding breach reason expired neutering deadline`)
      const currentBreaches = toUpdate.dog.dog_breaches.map((breach) => breach.breach_category.short_name)
      currentBreaches.push(breachReasons.NEUTERING_DEADLINE_EXCEEDED)
      await dogService.setBreaches(toUpdate.dog.index_number, currentBreaches, user, t)
      rowsChangedCount++
    }
    return `Success Neutering Expiry add breach reason - updated ${rowsChangedCount} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Neutering Expiry add breach reason:', e)
    throw new Error(`Error auto-updating statuses when Neutering Expiry add breach reason: ${e}`)
  }
}

module.exports = {
  setExpiredNeuteringDeadlineToInBreach,
  addBreachReasonToExpiredNeuteringDeadline
}
