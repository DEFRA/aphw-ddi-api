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

const preparePostalNameAndAddress = (person) => {
  const { firstName, lastName, contactDetails } = person
  const addrParts = []

  if ((firstName && firstName !== '') || (lastName && lastName !== '')) {
    addrParts.push(`${firstName ?? ''} ${lastName ?? ''}`.trim())
  }
  if (contactDetails?.addressLine1 && contactDetails?.addressLine1 !== '') {
    addrParts.push(contactDetails.addressLine1)
  }
  if (contactDetails?.addressLine2 && contactDetails?.addressLine2 !== '') {
    addrParts.push(contactDetails.addressLine2)
  }
  if (contactDetails?.town && contactDetails?.town !== '') {
    addrParts.push(contactDetails.town)
  }
  if (contactDetails?.postcode && contactDetails?.postcode !== '') {
    addrParts.push(contactDetails.postcode)
  }

  return addrParts.join('\n')
}

module.exports = {
  buildAddressString,
  buildAddressStringAlternate,
  buildAddressForSearchResults,
  preparePostalNameAndAddress
}
