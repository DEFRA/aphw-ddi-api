const { paranoidRetentionPeriod } = require('../config/index')
const { overnightJobUser } = require('../constants/import')

const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { purgeDogByIndexNumber } = require('../repos/dogs')
const { purgePersonByReferenceNumber } = require('../repos/people')

/**
 * Class representing a count of deleted records.
 * @constructor
 */
function DeletedRecordCount () {
  /**
   * @type {number}
   */
  this.dogs = 0
  /**
   * @type {number}
   */
  this.owners = 0
}

/**
 * Get the total number of deleted records.
 * @name DeletedRecordCount#total
 * @type {number}
 * @readonly
 */
Object.defineProperty(DeletedRecordCount.prototype, 'total', {
  get () {
    return this.dogs + this.owners
  }
})

/**
 * @constructor
 */
function DeletedRecords () {
  /**
   * @type {string[]}
   */
  this.dogs = []
  /**
   * @type {string[]}
   */
  this.owners = []
}

/**
 * @typedef {{
 *  count: {
 *    success: DeletedRecordCount,
 *    failed: DeletedRecordCount
 *  },
 *  deleted: {
 *    success: DeletedRecords,
 *    failed: DeletedRecords
 *  }
 * }} SoftDeletedRecordPayload
 */

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

  /**
   * @type {SoftDeletedRecordPayload}
   */
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
      return 'Purge deleted records.\r' +
        ` Success: ${this.count.success.dogs} Dogs ${this.count.success.owners} Owners - ${[...this.deleted.success.dogs, ...this.deleted.success.owners].join(', ')}.\r` +
        ` Failed: ${this.count.failed.dogs} Dogs ${this.count.failed.owners} Owners - ${[...this.deleted.failed.dogs, ...this.deleted.failed.owners].join(', ')}.\r`
    }
  }

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
      result.deleted.success.dogs.push(dog.index_number)
      result.count.success.dogs++
    } catch (e) {
      console.log(`Failed to hard delete dog record ${dog.index_number}`, e)
      result.count.failed.dogs++
    }
  }

  for (const owner of ownerResults) {
    try {
      await purgePersonByReferenceNumber(owner.person_reference, overnightJobUser)
      result.deleted.success.owners.push(owner.person_reference)
      result.count.success.owners++
    } catch (e) {
      console.log(`Failed to hard delete owner record ${owner.person_reference}`, e)
      result.count.failed.owners++
    }
  }

  return result
}

module.exports = {
  purgeSoftDeletedRecords
}
