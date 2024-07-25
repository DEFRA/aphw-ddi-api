const wreck = require('@hapi/wreck')
const config = require('../../config/index')

const osBaseUrl = config.osPlacesApi.baseUrl
const postcodeEndpoint = 'postcode'

const osOptions = {
  headers: {
    key: config.osPlacesApi.token
  },
  json: true
}

const getPostcodeLongLat = async (postcode) => {
  try {
    const { payload } = await wreck.get(`${osBaseUrl}/${postcodeEndpoint}?postcode=${postcode}&output_srs=WGS84`, osOptions)

    // Only grab first result, even if many
    return payload.results && payload.results.length > 0
      ? { lng: payload.results[0].DPA.LNG, lat: payload.results[0].DPA.LAT }
      : null
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = {
  getPostcodeLongLat
}
