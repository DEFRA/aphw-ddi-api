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

module.exports = {
  personMatchCodesStandard,
  personMatchCodesStandardMatch,
  personMatchCodesOther,
  personMatchCodesNoCodes
}
