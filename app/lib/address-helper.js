const isStringSupplied = (str) => {
  return str && str !== ''
}

const buildAddressString = (address, includeAlternatePostcode) => {
  const addrParts = []
  if (isStringSupplied(address?.address_line_1)) {
    addrParts.push(address.address_line_1)
  }
  if (isStringSupplied(address?.address_line_2)) {
    addrParts.push(address.address_line_2)
  }
  if (isStringSupplied(address?.town)) {
    addrParts.push(address.town)
  }
  if (isStringSupplied(address?.postcode)) {
    addrParts.push(address.postcode)
    if (includeAlternatePostcode && address.postcode.indexOf(' ') > -1) {
      addrParts.push(address.postcode.replaceAll(' ', ''))
    }
  }
  return addrParts.join(', ')
}

const buildAddressStringAlternate = (address) => {
  const addrParts = []
  if (isStringSupplied(address?.addressLine1)) {
    addrParts.push(address.addressLine1)
  }
  if (isStringSupplied(address?.addressLine2)) {
    addrParts.push(address.addressLine2)
  }
  if (isStringSupplied(address?.town)) {
    addrParts.push(address.town)
  }
  if (isStringSupplied(address?.postcode)) {
    addrParts.push(address.postcode)
  }
  return addrParts.join(', ')
}

const buildAddressForSearchResults = (address) => {
  address.address_line_2 = null
  return buildAddressString(address)
}

const preparePostalNameAndAddress = (person) => {
  const { firstName, lastName, contactDetails } = person
  const addrParts = []

  if (isStringSupplied(firstName) || isStringSupplied(lastName)) {
    addrParts.push(`${firstName ?? ''} ${lastName ?? ''}`.trim())
  }
  if (isStringSupplied(contactDetails?.addressLine1)) {
    addrParts.push(contactDetails.addressLine1)
  }
  if (isStringSupplied(contactDetails?.addressLine2)) {
    addrParts.push(contactDetails.addressLine2)
  }
  if (isStringSupplied(contactDetails?.town)) {
    addrParts.push(contactDetails.town)
  }
  if (isStringSupplied(contactDetails?.postcode)) {
    addrParts.push(contactDetails.postcode)
  }

  return addrParts.join('\n')
}

module.exports = {
  buildAddressString,
  buildAddressStringAlternate,
  buildAddressForSearchResults,
  preparePostalNameAndAddress,
  isStringSupplied
}
