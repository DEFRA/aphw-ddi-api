const { paranoidRetentionPeriod } = require('../config/index')

/**
 * @typedef {{
 *         count: {
 *           dogs: number,
 *           owners: number,
 *           total: number
 *         },
 *         deleted: {
 *           dogs: string[],
 *           owners: string[]
 *         }
 *       }} SoftDeletedRecordPayload
 */

const sequelize = require('../config/db')
const { Op } = require('sequelize')
/**
 * @param {Date} date
 * @return {Promise<SoftDeletedRecordPayload>}
 */
const purgeSoftDeletedRecords = async (date) => {
  const deleteAtCutOff = new Date(date)
  deleteAtCutOff.setUTCDate(deleteAtCutOff.getUTCDate() - paranoidRetentionPeriod)

  const ownerResults = await sequelize.models.person.findAll({
    where: {
      deleted_at: {
        [Op.lte]: deleteAtCutOff
      }
    },
    paranoid: false
  })

  const count = {
    dogs: 0,
    owners: 0,
    get total () {
      return this.dogs + this.owners
    }
  }
  const owners = []

  for (const owner of ownerResults) {
    try {
      owners.push(owner.person_reference)
      count.owners++
    } catch (e) {
      console.log(`Failed to hard delete owner record ${owner.person_reference}`, e)
    }
  }

  const dogs = []

  const dogResults = await sequelize.models.dog.findAll({
    where: {
      deleted_at: {
        [Op.lte]: deleteAtCutOff
      }
    },
    paranoid: false
  })

  for (const dog of dogResults) {
    try {
      dogs.push(dog.index_number)
      count.dogs++
    } catch (e) {
      console.log(`Failed to hard delete dog record ${dog.index_number}`, e)
    }
  }

  return {
    count,
    deleted: {
      dogs,
      owners
    }
  }
}

module.exports = {
  purgeSoftDeletedRecords
}
