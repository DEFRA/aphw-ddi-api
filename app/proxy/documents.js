const wreck = require('@hapi/wreck')
const config = require('../config/index')

const populateTemplate = async (options) => {
  await wreck.post(`${config.ddiDocumentsApi.baseUrl}/populate-template`, options)
}

module.exports = {
  populateTemplate
}
