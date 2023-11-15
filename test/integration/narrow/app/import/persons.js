const personMatchCodesStandard = {
  first_name: 'John',
  last_name: 'Smith',
  person_reference: 'PREF_STD1',
  matchCodes: ['J123 S456', 'J222 S677']
}

const personMatchCodesStandardMatch = {
  first_name: 'Juan',
  last_name: 'Smythe',
  person_reference: 'PREF_STD1',
  matchCodes: ['J123 S456', 'J222 S677']
}

const personMatchCodesOther = {
  first_name: 'Peter',
  last_name: 'Fawkes',
  person_reference: 'PREF_OTH1',
  matchCodes: ['P123 F456']
}

const personMatchCodesNoCodes = {
  first_name: 'David',
  last_name: 'Embleton',
  person_reference: 'PREF_NC1'
}

const testBacklogPerson = {
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
  contacts: []
}

module.exports = {
  personMatchCodesStandard,
  personMatchCodesStandardMatch,
  personMatchCodesOther,
  personMatchCodesNoCodes,
  testBacklogPerson
}
