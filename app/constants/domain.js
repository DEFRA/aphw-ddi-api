const domain = {
  updateKeys: {
    applicationPackSent: ['applicationPackSent'],
    applicationPackProcessed: ['applicationPackProcessed'],
    applicationFeePaid: ['applicationFeePaid'],
    applicationFeePaymentRecorded: ['applicationFeePaymentRecorded'],
    form2Sent: ['form2Sent'],
    neuteringConfirmation: ['neuteringConfirmation'],
    microchipVerification: ['microchipVerification'],
    verificationDateRecorded: [
      'neuteringConfirmation',
      'microchipVerification',
      'neuteringDeadline',
      'microchipDeadline',
      'verificationDatesRecorded'
    ],
    certificateIssued: ['certificateIssued'],
    insurance: ['insurance'],
    microchip: ['microchip'],
    status: ['status'],
    insuranceDetailsRecorded: ['insuranceDetailsRecorded'],
    microchipNumberRecorded: ['microchipNumberRecorded']
  },
  updateMappings: {
    applicationPackSent: 'dog.registration.application_pack_sent',
    applicationPackProcessed: 'dog.registration.application_pack_processed',
    applicationFeePaid: 'dog.registration.application_fee_paid',
    form2Sent: 'dog.registration.form_two_sent',
    insuranceDetailsRecorded: 'dog.registration.insurance_details_recorded',
    microchipNumberRecorded: 'dog.registration.microchip_number_recorded',
    applicationFeePaymentRecorded: 'dog.registration.application_fee_payment_recorded',
    verificationDatesRecorded: 'dog.registration.verification_dates_recorded',
    neuteringConfirmation: 'dog.registration.neutering_confirmation',
    microchipVerification: 'dog.registration.microchip_verification',
    neuteringDeadline: 'dog.registration.neutering_deadline',
    microchipDeadline: 'dog.registration.microchip_deadline',
    certificateIssued: 'dog.registration.certificate_issued',
    insurance: 'dog.insurance',
    microchip: 'dog.microchip',
    status: 'dog.status'
  }
}

module.exports = domain
