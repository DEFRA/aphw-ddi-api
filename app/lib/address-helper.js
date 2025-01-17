const buildAddressString = (address, includeAlternatePostcode) => {
  const addrParts = []
  if (address?.address_line_1) {
    addrParts.push(address.address_line_1)
  }
  if (address?.address_line_2) {
    addrParts.push(address.address_line_2)
  }
  if (address?.town) {
    addrParts.push(address.town)
  }
  if (address?.postcode) {
    addrParts.push(address.postcode)
    if (includeAlternatePostcode && address.postcode.indexOf(' ') > -1) {
      addrParts.push(address.postcode.replaceAll(' ', ''))
    }
  }
  return addrParts.join(', ')
}

const buildAddressStringAlternate = (address) => {
  const addrParts = []
  if (address?.addressLine1) {
    addrParts.push(address.addressLine1)
  }
  if (address?.addressLine2) {
    addrParts.push(address.addressLine2)
  }
  if (address?.town) {
    addrParts.push(address.town)
  }
  if (address?.postcode) {
    addrParts.push(address.postcode)
  }
  return addrParts.join(', ')
}

const buildAddressForSearchResults = (address) => {
  address.address_line_2 = null
  return buildAddressString(address)
}

const shuffleAddress = (address) => {
  const addrParts = []
  if (address?.addressLine1 && address?.addressLine1 !== '') {
    addrParts.push(address.addressLine1)
  }
  if (address?.addressLine2 && address?.addressLine2 !== '') {
    addrParts.push(address.addressLine2)
  }
  if (address?.town && address?.town !== '') {
    addrParts.push(address.town)
  }
  if (address?.postcode && address?.postcode !== '') {
    addrParts.push(address.postcode)
  }

  if (addrParts.length < 4) {
    const blankRowsRequired = 4 - addrParts.length
    for (let i = 0; i < blankRowsRequired; i++) {
      addrParts.push('')
    }
  }

  return {
    addressLine1: addrParts[0],
    addressLine2: addrParts[1],
    town: addrParts[2],
    postcode: addrParts[3]
  }
}

module.exports = {
  buildAddressString,
  buildAddressStringAlternate,
  buildAddressForSearchResults,
  shuffleAddress
}
