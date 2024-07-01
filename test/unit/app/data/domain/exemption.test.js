const Exemption = require('../../../../../app/data/domain/exemption')
const { inXDays } = require('../../../../time-helper')
const { InvalidDateError } = require('../../../../../app/errors/domain/invalidDate')
const { IncompleteDataError } = require('../../../../../app/errors/domain/incompleteData')

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

  describe('sendApplicationPack', () => {
    test('should set application pack sent', () => {
      const exemption = new Exemption(exemptionProperties)
      exemption.sendApplicationPack()
      expect(exemption.applicationPackSent).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([{
        key: 'applicationPackSent',
        value: expect.any(Date),
        callback: undefined
      }])
    })
  })

  describe('addInsuranceDetails', () => {
    const dogsTrustCompany = 'Dog\'s Trust'
    const insuranceExemptionProperties = {
      ...exemptionProperties,
      insurance: []
    }
    const exemption = new Exemption(insuranceExemptionProperties)
    const callback = jest.fn()
    const validRenewalDate = inXDays(60)

    test('should start with correct details', () => {
      expect(exemption.insurance).toEqual([])
    })

    test('should set insurance', () => {
      exemption.setInsuranceDetails(dogsTrustCompany, validRenewalDate, callback)
      expect(exemption.insurance).toEqual([{
        company: dogsTrustCompany,
        insuranceRenewal: validRenewalDate
      }])
      expect(exemption.getChanges()).toEqual([
        {
          key: 'insurance',
          value: {
            company: dogsTrustCompany,
            insuranceRenewal: validRenewalDate
          },
          callback
        }
      ])
    })

    test('should not record insurance details given date is in the past', () => {
      const exemption = new Exemption(insuranceExemptionProperties)
      expect(() => exemption.setInsuranceDetails(dogsTrustCompany, inXDays(-1), callback)).toThrow(new InvalidDateError('Insurance renewal date must be in the future'))
      expect(exemption.insurance).toEqual([])
    })

    test('should not record insurance details given date is today', () => {
      const exemption = new Exemption(insuranceExemptionProperties)
      expect(() => exemption.setInsuranceDetails(dogsTrustCompany, inXDays(new Date()), callback)).toThrow(new InvalidDateError('Insurance renewal date must be in the future'))
      expect(exemption.insurance).toEqual([])
    })

    test('should not allow submission of only company', () => {
      const exemption = new Exemption(insuranceExemptionProperties)
      expect(() => exemption.setInsuranceDetails(dogsTrustCompany, undefined, callback)).toThrow(new IncompleteDataError('Insurance renewal date must be submitted'))
      expect(exemption.insurance).toEqual([])
    })

    test('should not allow submission of only renewal Date', () => {
      const exemption = new Exemption(insuranceExemptionProperties)
      expect(() => exemption.setInsuranceDetails('', inXDays(60), callback)).toThrow(new IncompleteDataError('Insurance company must be submitted'))
      expect(exemption.insurance).toEqual([])
    })

    test('should allow submission of empty values', () => {
      const exemption = new Exemption(exemptionProperties)

      exemption.setInsuranceDetails('', undefined, callback())

      expect(exemption.insurance).toEqual([])
    })
  })
})
