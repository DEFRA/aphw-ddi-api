const Exemption = require('../../../../../app/data/domain/exemption')

describe('Exemption', () => {
  const exemptionProperties = {
    exemptionOrder: '2015',
    cdoIssued: '2023-10-10',
    cdoExpiry: '2023-12-10',
    court: 'Aberystwyth Justice Centre',
    policeForce: 'Avon and Somerset Constabulary',
    legislationOfficer: 'Sidney Lewis',
    certificateIssued: null,
    applicationFeePaid: null,
    insurance: [
      {
        company: 'Allianz',
        insuranceRenewal: '2024-01-01T00:00:00.000Z'
      }
    ],
    neuteringConfirmation: null,
    microchipVerification: null,
    joinedExemptionScheme: '2023-12-10',
    nonComplianceLetterSent: null,
    applicationPackSent: null,
    formTwoSent: null
  }

  test('should create an exemption', () => {
    const exemption = new Exemption(exemptionProperties)

    expect(exemption).toEqual(expect.objectContaining({
      exemptionOrder: '2015',
      cdoIssued: '2023-10-10',
      cdoExpiry: '2023-12-10',
      court: 'Aberystwyth Justice Centre',
      policeForce: 'Avon and Somerset Constabulary',
      legislationOfficer: 'Sidney Lewis',
      certificateIssued: null,
      applicationFeePaid: null,
      insurance: [
        {
          company: 'Allianz',
          insuranceRenewal: '2024-01-01T00:00:00.000Z'
        }
      ],
      neuteringConfirmation: null,
      microchipVerification: null,
      joinedExemptionScheme: '2023-12-10',
      nonComplianceLetterSent: null,
      applicationPackSent: null,
      formTwoSent: null
    }))
    expect(exemption).toBeInstanceOf(Exemption)
  })

  test('should set application pack sent', () => {
    const exemption = new Exemption(exemptionProperties)
    exemption.sendApplicationPack()
    expect(exemption.applicationPackSent).toEqual(expect.any(Date))
    expect(exemption.getBulkChanges()).toEqual({
      applicationPackSent: expect.any(Date)
    })
  })
})
