const wreck = require('@hapi/wreck')
const config = require('../../config/index')

const lookupPoliceForceByPostcode = async (postcode, swallowError) => {
  const url = `${config.robotImportPoliceApiUrl}?postcode=${postcode}`
  try {
    const { payload } = await wreck.get(url, { json: true })
    return payload
  } catch (e) {
    if (!swallowError) {
      console.log(e)
    }
    return null
  }
}

module.exports = {
  lookupPoliceForceByPostcode
}
