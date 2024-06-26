/**
 * @param {string} key
 * @param {{
 *    available?: boolean,
 *    completed?: boolean,
 *    readonly?: boolean
 * }} [state]
 * @param {Date|undefined} [timestamp]
 * @constructor
 * @property {string} key
 * @property {boolean} available
 * @property {boolean} completed
 * @property {boolean} readonly
 * @property {Date|undefined} timestamp
 */
function CdoTask (key, state = {}, timestamp) {
  this.key = key
  this.available = state.available ?? false
  this.completed = state.completed ?? false
  this.readonly = state.readonly ?? false
  this.timestamp = timestamp
}

module.exports = CdoTask
