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
 * @return {Promise<SoftDeletedRecordPayload>}
 */
const purgeSoftDeletedRecords = async () => ({})

module.exports = {
  purgeSoftDeletedRecords
}
