const getMicrochip = (data, displayOrder) => {
  const microchip = data.dog_microchips?.filter(x => x.microchip.display_order === displayOrder)
  if (!microchip || microchip.length === 0) {
    return null
  }
  return microchip[0]?.microchip?.microchip_number
}

module.exports = {
  getMicrochip
}
