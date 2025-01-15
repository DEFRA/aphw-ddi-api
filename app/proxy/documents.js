const wreck = require('@hapi/wreck')
const config = require('../config/index')

/**
 * @param {{ payload: any }} options
 * @return {Promise<void>}
 */
const populateTemplate = async (options) => {
  await wreck.post(`${config.ddiDocumentsApi.baseUrl}/populate-template`, options)
}

module.exports = {
  populateTemplate
}
