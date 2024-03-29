const payload = {
  owner: {
    firstName: 'Joe',
    lastName: 'Bloggs',
    dateOfBirth: '1998-05-10',
    address: {
      addressLine1: '14 Fake Street',
      town: 'Fake Town',
      postcode: 'FA1 2KE'
    },
    email: 'me@here.com',
    primaryTelephone: '01911234567',
    secondaryTelephone: '01911234555'
  },
  enforcementDetails: {
    policeForce: '1',
    court: '1',
    legislationOfficer: 'John Smith'
  },
  dogs: [
    {
      breed: 'Pit Bull Terrier',
      name: 'Buster',
      cdoIssued: '2023-10-10',
      cdoExpiry: '2023-12-10'
    },
    {
      breed: 'XL Bully',
      name: 'Alice',
      cdoIssued: '2023-10-10',
      cdoExpiry: '2023-12-10'
    }
  ]
}

module.exports = payload
