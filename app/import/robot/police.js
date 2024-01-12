const wreck = require('@hapi/wreck')
const config = require('../../config/index')

const lookupPoliceForceByPostcode = async (postcode) => {
  const url = `${config.robotImportPoliceApiUrl}?postcode=${postcode}`
  try {
    const { payload } = await wreck.get(url, { json: true })
    return payload
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = {
  lookupPoliceForceByPostcode
}
