/**
 * @typedef ErrorResponse
 * @property {number} code
 * @property {string} message
 * @property {*} data
 */

/**
 * @typedef BulkRequestResponse
 * @property {*[]} items
 * @property {ErrorResponse[]} errors
 */

/**
 * @param {BulkRequestResponse} response
 * @return {number}
 */
const getHttpCodeFromResults = ({ errors }) => {
  if (!errors || !errors.length) {
    return 200
  }

  const [firstItem, secondCodeFromMixedSet] = new Set(errors.map(error => error.code))

  if (!secondCodeFromMixedSet) {
    return firstItem
  }

  return 400
}

module.exports = {
  getHttpCodeFromResults
}
