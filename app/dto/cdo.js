const { getMicrochip, calculateNeuteringDeadline } = require('./dto-helper')

const generateOrderSpecificData = (data) => {
  if (data.registration.exemption_order.exemption_order === '2023') {
    return {
      microchipDeadline: data.registration.microchip_deadline,
      neuteringDeadline: calculateNeuteringDeadline(data.birth_date),
      typedByDlo: data.registration.typed_by_dlo,
      withdrawn: data.registration.withdrawn
    }
  }
}

const cdoCreateDto = (data) => ({
  owner: {
    firstName: data.owner.first_name,
    lastName: data.owner.last_name,
    birthDate: data.owner.birth_date,
    address: {
      addressLine1: data.owner.address.address_line_1,
      addressLine2: data.owner.address.address_line_2,
      town: data.owner.address.town,
      postcode: data.owner.address.postcode,
      country: data.owner.address.country.country
    },
    personReference: data.owner.person_reference
  },
  enforcementDetails: {
    policeForce: data.dogs[0].registration.police_force.name,
    court: data.dogs[0].registration.court.name,
    legislationOfficer: data.dogs[0].registration.legislation_officer
  },
  dogs: data.dogs.map(d => ({
    indexNumber: d.index_number,
    name: d.name,
    microchipNumber: d.microchipNumber,
    status: d.status?.status,
    breed: d.dog_breed.breed,
    cdoIssued: d.registration.cdo_issued,
    cdoExpiry: d.registration.cdo_expiry,
    interimExemption: d.registration.joined_exemption_scheme
  }))
})

const cdoViewDto = (data) => {
  const person = data.registered_person[0].person

  return {
    person: {
      id: person.id,
      personReference: person.person_reference,
      firstName: person.first_name,
      lastName: person.last_name,
      dateOfBirth: person.birth_date,
      addresses: person.addresses,
      person_contacts: person.person_contacts,
      organisationName: person.organisation?.organisation_name ?? null
    },
    dog: {
      id: data.id,
      dogReference: data.dog_reference,
      indexNumber: data.index_number,
      name: data.name,
      breed: data.dog_breed.breed,
      status: data.status.status,
      dateOfBirth: data.birth_date,
      dateOfDeath: data.death_date,
      tattoo: data.tattoo,
      colour: data.colour,
      sex: data.sex,
      dateExported: data.exported_date,
      dateStolen: data.stolen_date,
      dateUntraceable: data.untraceable_date,
      microchipNumber: getMicrochip(data, 1),
      microchipNumber2: getMicrochip(data, 2)
    },
    exemption: {
      exemptionOrder: data.registration.exemption_order.exemption_order,
      cdoIssued: data.registration.cdo_issued,
      cdoExpiry: data.registration.cdo_expiry,
      court: data.registration.court?.name,
      policeForce: data.registration?.police_force?.name,
      legislationOfficer: data.registration.legislation_officer,
      certificateIssued: data.registration.certificate_issued,
      applicationFeePaid: data.registration.application_fee_paid,
      insurance: data.insurance?.sort((a, b) => a.id - b.id).map(i => ({
        company: i.company.company_name,
        insuranceRenewal: i.renewal_date
      })),
      neuteringConfirmation: data.registration.neutering_confirmation,
      microchipVerification: data.registration.microchip_verification,
      joinedExemptionScheme: data.registration.joined_exemption_scheme,
      removedFromCdoProcess: data.registration.removed_from_cdo_process,
      ...generateOrderSpecificData(data)
    }
  }
}

module.exports = {
  cdoCreateDto,
  cdoViewDto
}
