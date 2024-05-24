/**
 * @return {0|1|-1}
 * @param {{id: number}} addressA
 * @param {{id: number}} addressB
 */
const addressSort = (addressA, addressB) => {
  return addressB.id - addressA.id
}

const getLatestAddress = (addresses = []) => {
  const sortedAddress = [...addresses]
  sortedAddress.sort(addressSort)

  return [sortedAddress[0]]
}

module.exports = {
  addressSort,
  getLatestAddress
}
