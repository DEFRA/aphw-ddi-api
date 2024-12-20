const wreck = require('@hapi/wreck')
const config = require('../../config/index')
const { getPostcodeLongLat } = require('./postcode')
const { getPoliceForceByApiCode } = require('../../repos/police-forces')

const policeBaseUrl = config.policeApi.baseUrl
const policeLocationEndpoint = 'locate-neighbourhood'

const policeApiOptions = {
  json: true
}

const lookupPoliceForceByPostcode = async postcode => {
  const coords = await getPostcodeLongLat(postcode)
  const policeForceName = await getPoliceForce(coords)
  return await getPoliceForceByApiCode(policeForceName)
}

const getPoliceForce = async coords => {
  let retries = 0
  while (retries < 3) {
    try {
      const { payload } = await wreck.get(`${policeBaseUrl}/${policeLocationEndpoint}?q=${coords.lat},${coords.lng}`, policeApiOptions)
      // Only grab first result, even if many
      return payload?.force
    } catch (e) {
      if (e?.output?.statusCode === 429) {
        // Rate limiting
        retries++
        console.log('Rate limiting on Police API')
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }
      console.log('Error calling Police API', e)
      return null
    }
  }
  return null
}

module.exports = {
  lookupPoliceForceByPostcode,
  getPoliceForce
}
