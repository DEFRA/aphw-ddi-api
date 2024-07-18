const domain = {
  updateKeys: {
    applicationPackSent: ['applicationPackSent'],
    applicationFeePaid: ['applicationFeePaid'],
    form2Sent: ['form2Sent'],
    neuteringConfirmation: ['neuteringConfirmation'],
    microchipVerification: ['microchipVerification'],
    verificationDateRecorded: [
      'neuteringConfirmation',
      'microchipVerification'
    ],
    certificateIssued: ['certificateIssued'],
    insurance: ['insurance'],
    microchip: ['microchip'],
    status: ['status']
  },
  updateMappings: {
    applicationPackSent: 'dog.registration.application_pack_sent',
    applicationFeePaid: 'dog.registration.application_fee_paid',
    form2Sent: 'dog.registration.form_two_sent',
    neuteringConfirmation: 'dog.registration.neutering_confirmation',
    microchipVerification: 'dog.registration.microchip_verification',
    certificateIssued: 'dog.registration.certificate_issued',
    insurance: 'dog.insurance',
    microchip: 'dog.microchip',
    status: 'dog.status'
  }
}

module.exports = domain
