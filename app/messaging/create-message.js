const { CERTIFICATE_REQUESTED } = require('../constants/event/events')
const { SOURCE_API } = require('../constants/event/source')
const createEventMessage = (event) => {
  const { type, source, id, partitionKey = undefined, subject = undefined, data = undefined } = event
  return {
    body: {
      specversion: '1.0',
      type,
      source,
      id,
      partitionKey,
      time: new Date().toISOString(),
      subject,
      datacontenttype: 'text/json',
      data
    },
    type,
    source
  }
}

/**
 * @param {string} certificateId
 * @param {Cdo} data
 * @param user
 */
const createCertificateMessage = (certificateId, data, user) => {
  return {
    body: {
      certificateId,
      exemptionOrder: data.exemption.exemptionOrder,
      user,
      owner: {
        name: `${data.person.firstName} ${data.person.lastName}`,
        address: {
          line1: data.person.addresses[0].address.address_line_1,
          line2: data.person.addresses[0].address.address_line_2,
          line3: data.person.addresses[0].address.town,
          postcode: data.person.addresses[0].address.postcode
        },
        organisationName: data.person.organisationName
      },
      dog: {
        indexNumber: data.dog.indexNumber,
        microchipNumber: data.dog.microchipNumber,
        name: data.dog.name,
        breed: data.dog.breed,
        sex: data.dog.sex,
        birthDate: data.dog.dateOfBirth,
        colour: data.dog.colour
      }
    },
    type: CERTIFICATE_REQUESTED,
    source: SOURCE_API
  }
}

const getCustomFields = data => {
  if (!data?.customFields) {
    return {}
  }

  return data.customFields.reduce(
    (prev, cur) =>
      ({ ...prev, [cur.name]: cur.value }), {}
  )
}

/**
 * @param {EmailSchema} data
 */
const createEmailMessage = (data) => {
  return {
    id: data.id,
    time: new Date().toISOString(),
    specversion: '1.0',
    data: {
      personalisation: {
        personalisation: getCustomFields(data)
      },
      emailAddress: data.toAddress
    },
    type: data.type,
    source: SOURCE_API
  }
}

module.exports = {
  createEventMessage,
  createCertificateMessage,
  createEmailMessage
}
