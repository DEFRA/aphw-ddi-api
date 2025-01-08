const wreck = require('@hapi/wreck')
const config = require('../config/index')

const populateTemplate = async (data) => {
  await wreck.post(`${config.ddiDocumentsApi.baseUrl}/populate-template`, { payload: data })
}

module.exports = {
  populateTemplate
}
