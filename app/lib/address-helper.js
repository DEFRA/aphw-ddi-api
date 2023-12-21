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

module.exports = {
  buildAddressString
}
