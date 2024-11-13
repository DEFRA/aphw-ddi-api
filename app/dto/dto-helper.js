const { differenceInYears } = require('date-fns')
const { formatDateAsUTCNoTime } = require('../lib/date-helpers')

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
    return new Date('2025-06-30')
  }

  return new Date('2024-06-30')
}

const extractEmail = (contacts) => {
  if (!contacts || contacts.length === 0) {
    return ''
  }

  const email = contacts.filter(x => x.contact.contact_type.contact_type === 'Email').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)

  return email.length > 0 ? email[0] : null
}

const extractLatestPrimaryTelephoneNumber = (contacts) => {
  if (contacts && contacts.length > 0) {
    const primaryPhones = contacts.filter(x => x.contact.contact_type.contact_type === 'Phone').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)

    if (primaryPhones.length > 0) {
      return primaryPhones[0]
    }
  }

  return null
}

const extractLatestSecondaryTelephoneNumber = (contacts) => {
  if (contacts && contacts.length > 0) {
    const secondaryPhones = contacts.filter(x => x.contact.contact_type.contact_type === 'SecondaryPhone').sort(propertyComparatorDesc('contact', 'id')).map(y => y.contact.contact)

    if (secondaryPhones.length > 0) {
      return secondaryPhones[0]
    }
  }

  return null
}

const extractLatestAddress = (addresses) => {
  if (addresses == null || addresses.length === 0) {
    return {}
  }

  const latestAddress = addresses.sort(propertyComparatorDesc('address', 'id'))[0].address

  return {
    address_line_1: latestAddress.address_line_1,
    address_line_2: latestAddress.address_line_2,
    town: latestAddress.town,
    postcode: latestAddress.postcode,
    county: latestAddress.county,
    country: latestAddress.country?.country
  }
}

const extractBreachCategories = (dogBreaches) => {
  return (dogBreaches ?? []).map(dogBreach => dogBreach.breach_category.label).join(',\n')
}

const extractLatestInsurance = (insurances) => {
  if (insurances == null || insurances.length === 0) {
    return {}
  }

  return insurances.sort(propertyComparatorDesc('id'))[0]
}

const propertyComparatorDesc = (propertyName, childPropertyName) => {
  return function (a, b) {
    return childPropertyName ? b[propertyName][childPropertyName] - a[propertyName][childPropertyName] : b[propertyName] - a[propertyName]
  }
}

const truncDate = (inDate) => {
  if (!inDate) {
    return ''
  }

  let day = inDate.getDate()
  if (parseInt(day) < 10) {
    day = `0${day}`
  }

  let month = inDate.getMonth() + 1
  if (parseInt(month) < 10) {
    month = `0${month}`
  }

  const year = inDate.getFullYear()

  return `${year}-${month}-${day}`
}

const stripTime = (inDate) => {
  if (!inDate) {
    return null
  }

  if (typeof inDate === 'object') {
    return formatDateAsUTCNoTime(inDate)
  }

  return inDate.replace('T00:00:00.000Z', '')
}

module.exports = {
  getMicrochip,
  getMicrochips,
  calculateNeuteringDeadline,
  extractLatestInsurance,
  extractBreachCategories,
  extractEmail,
  extractLatestAddress,
  extractLatestPrimaryTelephoneNumber,
  extractLatestSecondaryTelephoneNumber,
  truncDate,
  stripTime
}
