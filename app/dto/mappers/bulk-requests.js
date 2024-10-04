/**
 * @typedef ErrorResponse
 * @property {number} [code]
 * @property {number} [statusCode]
 * @property {string} message
 * @property {*} data
 */

/**
 * @typedef BulkRequestResponse
 * @property {*} data
 * @property {ErrorResponse[]} errors
 */

/**
 * @param {BulkRequestResponse} response
 * @return {number}
 */
const getHttpCodeFromResults = ({ items, errors }) => {
  if (!errors || !errors.length) {
    return 200
  }

  if (items.length) {
    return 400
  }

  const [firstItem, secondCodeFromMixedSet] = new Set(errors.map(error => error.statusCode))

  if (!secondCodeFromMixedSet) {
    return firstItem
  }

  return 400
}

module.exports = {
  getHttpCodeFromResults
}
