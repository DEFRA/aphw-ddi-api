const accessDbSchema = {
  ID: {
    prop: 'id',
    type: Number,
    required: true
  },
  //  'M-Person Number': {
  //    prop: 'personNumber',
  //    type: Number,
  //    required: true
  //  },
  'M-Title': {
    prop: 'title',
    type: String
  },
  'M-First Name': {
    prop: 'firstName',
    type: String,
    required: true
  },
  'M-Surname': {
    prop: 'lastName',
    type: String,
    required: true
  },
  'M-Address Line 1': {
    prop: 'addressLine1',
    type: String,
    required: true
  },
  'M-Address Line 2': {
    prop: 'addressLine2',
    type: String
  },
  'M-Address Line 3': {
    prop: 'addressLine3',
    type: String
  },
  'M-County': {
    prop: 'county',
    type: String
  },
  'Police Force': {
    prop: 'policeForce',
    type: String
  },
  'Post Code 1': {
    prop: 'postcodePart1',
    type: String,
    required: true
  },
  'M-Post Code 2': {
    prop: 'postcodePart2',
    type: String,
    required: true
  },
  'M-Country': {
    prop: 'country',
    type: String
  },
  'M-Telphone-1': {
    prop: 'phone1',
    type: String
  },
  'M-Telephone-2': {
    prop: 'phone2',
    type: String
  },
  'M-E-mail': {
    prop: 'email',
    type: String
  },
  'M-Fax': {
    prop: 'fax',
    type: String
  },
  'M-Comments-Owner': {
    prop: 'comments',
    type: String
  },
  Designation: {
    prop: 'designation',
    type: String
  },
  'D-Index Number': {
    prop: 'dogIndexNumber',
    type: Number,
    required: true
  },
  'D-Notification Date': {
    prop: 'notificationDate',
    type: Date
  },
  'D-Notification Year': {
    prop: 'notificationYear',
    type: Number
  },
  'D-Status': {
    prop: 'status',
    type: String,
    required: true
  },
  'D-Year of Death': {
    prop: 'yearOfDeath',
    type: Number
  },
  Active: {
    prop: 'active',
    type: String
  },
  'D-Name': {
    prop: 'dogName',
    type: String
  },
  Breed: {
    prop: 'breed',
    type: String
  },
  'Breed Cross': {
    prop: 'breedCross',
    type: String
  },
  'D-Date of Birth': {
    prop: 'dogDateOfBirth',
    type: Date
  },
  'D-Sex': {
    prop: 'sex',
    type: String
  },
  Colour: {
    prop: 'colour',
    type: String
  },
  'D-Tattoo': {
    prop: 'tattoo',
    type: String
  },
  'D-Microchip Number': {
    prop: 'microchipNumber',
    type: String
  },
  'Microchip Type': {
    prop: 'microchipType',
    type: String
  },
  'D-Identification Valid': {
    prop: 'identificationValid',
    type: String,
    oneOf: [
      'Yes',
      'No',
      'STA'
    ]
  },
  'D-Neutering Valid': {
    prop: 'neuteringValid',
    type: String,
    oneOf: [
      'Yes',
      'No'
    ]
  },
  'D-First Insurance Paid': {
    prop: 'firstInsurancePaid',
    type: String,
    oneOf: [
      'Yes',
      'No'
    ]
  },
  'D-Application Fee Paid': {
    prop: 'applicationFeePaid',
    type: String,
    oneOf: [
      'Yes',
      'No'
    ]
  },
  'D-Certificate Issued': {
    prop: 'certificateIssued',
    type: String,
    oneOf: [
      'Yes',
      'No',
      'STA'
    ]
  },
  'D-Certificate Printed': {
    prop: 'certificatePrinted',
    type: String,
    oneOf: [
      'Yes',
      'No',
      'STA'
    ]
  },
  'D-Print Certificate': {
    prop: 'printCertificate',
    type: String,
    oneOf: [
      'Yes',
      'No'
    ]
  },
  'D-Dog Exported': {
    prop: 'dogExported',
    type: String,
    oneOf: [
      'Yes',
      'No'
    ]
  },
  'D-Insurance Expiry Date': {
    prop: 'insuranceExpiryDate',
    type: Date
  },
  'D-Insurance Renewal': {
    prop: 'insuranceRenewal',
    type: String
  },
  'Insurance Company': {
    prop: 'insuranceCompany',
    type: String
  },
  'D-Policy Number': {
    prop: 'policyNumber',
    type: String
  },
  'Record Completed': {
    prop: 'recordCompleted',
    type: String
  },
  Stage: {
    prop: 'stage',
    type: String
  },
  'Time Limit': {
    prop: 'timeLimit',
    type: String
  },
  'Documentation Destroyed': {
    prop: 'documentationDestroyed',
    type: String,
    oneOf: [
      'Yes',
      'No',
      'Ye',
      'Yed',
      'OK'
    ]
  },
  'D-Interim Exemption Scheme': {
    prop: 'interimExcemptionScheme',
    type: Boolean
  },
  'D-Date Joined Interim Exemption Scheme': {
    prop: 'dateJoinedInterimExcemptionScheme',
    type: Date
  }
}

module.exports = accessDbSchema
