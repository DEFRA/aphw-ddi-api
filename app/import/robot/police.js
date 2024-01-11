const wreck = require('@hapi/wreck')
const config = require('../../config/index')

const lookupPoliceForceByPostcode = async (postcode) => {
  const url = `${config.robotImportPoliceApiUrl}?postcode=${postcode}`
  console.log('url', url)
  const { payload } = await wreck.get(url, { json: true })
  console.log('force', payload?.name)
}

module.exports = {
  lookupPoliceForceByPostcode
}
