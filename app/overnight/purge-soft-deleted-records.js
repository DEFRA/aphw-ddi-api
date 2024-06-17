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

/**
 * @param {Date} date
 * @return {Promise<SoftDeletedRecordPayload>}
 */
const purgeSoftDeletedRecords = async (date) => {
  return {
    count: {
      dogs: 0,
      owners: 0,
      total: 0
    },
    deleted: {
      dogs: [],
      owners: []
    }
  }
}

module.exports = {
  purgeSoftDeletedRecords
}
