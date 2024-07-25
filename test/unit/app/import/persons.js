const personMatchCodesStandard = {
  first_name: 'John',
  last_name: 'Smith',
  person_reference: 'PREF_STD1',
  address_line_1: '1 Anywhere St',
  postcode: 'AB1 2CD',
  matchCodes: ['J123 S456', 'J222 S677']
}

const personMatchCodesStandardMatch = {
  first_name: 'Juan',
  last_name: 'Smythe',
  person_reference: 'PREF_STD1',
  address_line_1: '1 Anywhere St',
  postcode: 'AB1 2CD',
  matchCodes: ['J123 S456', 'J222 S677']
}

const personMatchCodesOther = {
  first_name: 'Peter',
  last_name: 'Fawkes',
  person_reference: 'PREF_OTH1',
  address_line_1: '123 Springfield Avenue',
  postcode: 'SP2 3GH',
  matchCodes: ['P123 F456']
}

const personMatchCodesNoCodes = {
  first_name: 'David',
  last_name: 'Embleton',
  address_line_1: '1 Testington St',
  postcode: 'TS1 1TS',
  person_reference: 'PREF_NC1'
}

const personWithAddress = {
  title: 'Mr',
  first_name: 'Andrew',
  last_name: 'Robinson',
  address: {
    address_line_1: 'address line 1',
    address_line_2: '',
    address_line_3: 'Testington',
    county: 'Northumberland',
    postcode: 'TS1 1TS',
    country: 'England'
  },
  contacts: [],
  person_reference: 'REF1'
}

module.exports = {
  personMatchCodesStandard,
  personMatchCodesStandardMatch,
  personMatchCodesOther,
  personMatchCodesNoCodes,
  personWithAddress
}
