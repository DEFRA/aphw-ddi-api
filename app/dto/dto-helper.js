const getMicrochip = (data, position) => {
  const microchips = data.dog_microchips?.sort((a, b) => a.id - b.id)
  if (!microchips || microchips.length < position) {
    return null
  }
  return microchips[position - 1].microchip?.microchip_number
}

const getMicrochips = (data) => {
  return data.dog_microchips?.sort((a, b) => a.id - b.id)
}

module.exports = {
  getMicrochip,
  getMicrochips
}
