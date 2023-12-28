const { differenceInYears } = require('date-fns')

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

const calculateNeuteringDeadline = (dateOfBirth) => {
  if (dateOfBirth === null) {
    return dateOfBirth
  }

  const base = new Date(2024, 0, 31)

  const age = differenceInYears(base, dateOfBirth)

  if (age < 1) {
    return new Date('2024-12-31')
  }

  return new Date('2024-06-30')
}

module.exports = {
  getMicrochip,
  getMicrochips,
  calculateNeuteringDeadline
}

