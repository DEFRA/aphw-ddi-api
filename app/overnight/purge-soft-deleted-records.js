const { paranoidRetentionPeriod } = require('../config/index')
const { overnightJobUser } = require('../constants/import')

/**
 * @typedef {{
 *  count: {
 *    dogs: number,
 *    owners: number,
 *    total: number
 *  },
 *  deleted: {
 *    dogs: string[],
 *    owners: string[]
 *  }
 * }} SoftDeletedRecordPayload
 */

const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { purgeDogByIndexNumber } = require('../repos/dogs')

function DeletedRecordCount () {
  this.dogs = 0
  this.owners = 0
}

Object.defineProperty(DeletedRecordCount.prototype, 'total', {
  get () {
    return this.dogs + this.owners
  }
})

function DeletedRecords () {
  this.dogs = []
  this.owners = []
}
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

  const result = {
    count: {
      success: new DeletedRecordCount(),
      failed: new DeletedRecordCount()
    },
    deleted: {
      success: new DeletedRecords(),
      failed: new DeletedRecords()
    },
    toString () {
      return `Purge deleted records.  Success: ${this.count.success.dogs} Dogs ${this.count.success.owners} Owners - ${[...this.deleted.success.dogs, ...this.deleted.success.owners].join(', ')}.` +
        '  Failed'
    }
  }

  const owners = []

  for (const owner of ownerResults) {
    try {
      owners.push(owner.person_reference)
      result.count.success.owners++
    } catch (e) {
      console.log(`Failed to hard delete owner record ${owner.person_reference}`, e)
      result.count.failed.owners++
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
      await purgeDogByIndexNumber(dog.index_number, overnightJobUser)
      dogs.push(dog.index_number)
      result.count.success.dogs++
    } catch (e) {
      console.log(`Failed to hard delete dog record ${dog.index_number}`, e)
      result.count.failed.dogs++
    }
  }

  return result
}

module.exports = {
  purgeSoftDeletedRecords
}
