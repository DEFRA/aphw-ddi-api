const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { statuses, breachReasons } = require('../constants/statuses')
const { dbFindAll, dbFindOne } = require('../lib/db-functions')
const ServiceProvider = require('../service/config')

const findExpired = async (currentStatus, today, t) => {
  const isAfterJuneDeadline = today >= new Date('2024-07-27')
  const isAfterDecDeadline = today >= new Date('2025-01-01')

  return await dbFindAll(sequelize.models.registration, {
    where: {
      [Op.or]: [{
        [Op.and]: [
          {
            neutering_deadline: {
              [Op.eq]: new Date('2024-06-30')
            }
          },
          isAfterJuneDeadline ? sequelize.literal('1 = 1') : sequelize.literal('1 = 0')
        ]
      },
      {
        [Op.and]: [
          {
            neutering_deadline: {
              [Op.eq]: new Date('2024-12-31')
            }
          },
          isAfterDecDeadline ? sequelize.literal('1 = 1') : sequelize.literal('1 = 0')
        ]
      }],
      neutering_confirmation: {
        [Op.eq]: null
      },
      '$dog.status.status$': currentStatus
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
          as: 'dog_breaches'
        }
      ]
    },
    {
      model: sequelize.models.exemption_order,
      as: 'exemption_order'
    }],
    transaction: t
  })
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
  return dog.dog_breaches && dog.dog_breaches.some(breach => breach.breach_category_id === expiredDeadlineId)
}

const addBreachReasonToExpiredNeuteringDeadline = async (today, user, t) => {
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
      currentBreaches.push(breachReasons.INSURANCE_EXPIRED)
      await dogService.setBreaches(toUpdate.dog.index_number, currentBreaches, user, t)
    }
    return `Success Neutering Expiry add breach reason - updated ${addBreachReason.length} rows`
  } catch (e) {
    console.log('Error auto-updating statuses when Neutering Expiry add breach reason:', e)
    throw new Error(`Error auto-updating statuses when Neutering Expiry add breach reason: ${e}`)
  }
}

module.exports = {
  setExpiredNeuteringDeadlineToInBreach,
  addBreachReasonToExpiredNeuteringDeadline
}
