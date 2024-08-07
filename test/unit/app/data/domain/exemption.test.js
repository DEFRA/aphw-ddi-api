const Exemption = require('../../../../../app/data/domain/exemption')
const { inXDays } = require('../../../../time-helper')
const { InvalidDateError } = require('../../../../../app/errors/domain/invalidDate')
const { IncompleteDataError } = require('../../../../../app/errors/domain/incompleteData')
const { buildExemption, buildCdoInsurance } = require('../../../../mocks/cdo/domain')
const { SequenceViolationError } = require('../../../../../app/errors/domain/sequenceViolation')

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
    form2Sent: null,
    insuranceDetailsRecorded: null,
    microchipNumberRecorded: null,
    applicationFeePaymentRecorded: null,
    verificationDatesRecorded: null
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
      form2Sent: null,
      insuranceDetailsRecorded: null,
      microchipNumberRecorded: null,
      applicationFeePaymentRecorded: null,
      verificationDatesRecorded: null
    }))
    expect(exemption).toBeInstanceOf(Exemption)
  })

  describe('sendApplicationPack', () => {
    const auditDate = new Date()
    test('should set application pack sent', () => {
      const exemption = new Exemption(exemptionProperties)
      exemption.sendApplicationPack(auditDate)
      expect(exemption.applicationPackSent).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([{
        key: 'applicationPackSent',
        value: auditDate,
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
        renewalDate: validRenewalDate
      }])
      expect(exemption.insuranceDetailsRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'insuranceDetailsRecorded',
          value: expect.any(Date)
        },
        {
          key: 'insurance',
          value: {
            company: dogsTrustCompany,
            renewalDate: validRenewalDate
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

  describe('setApplicationFee', () => {
    const applicationFeeExemptionProperties = buildExemption({
      applicationFeePaid: null
    })
    const exemption = new Exemption(applicationFeeExemptionProperties)
    const callback = jest.fn()

    test('should start with correct details', () => {
      expect(exemption.applicationFeePaid).toBeNull()
    })

    test('should not allow a date in the future', () => {
      expect(() => exemption.setApplicationFee(new Date('9999-01-01'), callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(exemption.applicationFeePaid).toBeNull()
    })

    test('should set application fee', () => {
      const validApplicationFeePaid = new Date('2024-07-04')
      exemption.setApplicationFee(validApplicationFeePaid, callback)
      expect(exemption.applicationFeePaid).toEqual(validApplicationFeePaid)
      expect(exemption.getChanges()).toEqual([
        {
          key: 'applicationFeePaid',
          value: validApplicationFeePaid,
          callback
        }
      ])
    })
  })

  describe('sendForm2', () => {
    const auditDate = new Date()

    test('should set form two as sent', () => {
      const callback = jest.fn()
      const exemption = new Exemption({ ...exemptionProperties, form2Sent: null })
      exemption.sendForm2(auditDate, callback)
      expect(exemption.form2Sent).toEqual(auditDate)
      expect(exemption.getChanges()).toEqual([{
        key: 'form2Sent',
        value: auditDate,
        callback
      }])
      expect(() => exemption.getChanges()[0].callback()).not.toThrow()
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('verifyDates', () => {
    const microchipVerification = new Date('2024-07-03')
    const neuteringConfirmation = new Date('2024-07-03')
    const verifyDatesProperties = {
      ...exemptionProperties,
      microchipVerification: null,
      neuteringConfirmation: null
    }

    const exemption = new Exemption(verifyDatesProperties)
    const callback = jest.fn()

    test('should start with correct details', () => {
      expect(exemption.microchipVerification).toBeNull()
      expect(exemption.neuteringConfirmation).toBeNull()
    })

    test('should verifyDates', () => {
      exemption.verifyDates(microchipVerification, neuteringConfirmation, callback)
      expect(exemption.microchipVerification).toEqual(microchipVerification)
      expect(exemption.neuteringConfirmation).toEqual(neuteringConfirmation)
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation,
            microchipVerification
          },
          callback
        }
      ])
    })

    test('should throw if either date is in the future', () => {
      expect(() => exemption.verifyDates(new Date('9999-01-01'), neuteringConfirmation, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(() => exemption.verifyDates(microchipVerification, new Date('9999-01-01'), callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
    })
  })

  describe('issueCertificate', () => {
    const auditDate = new Date()

    test('should issue certificate', () => {
      const callback = jest.fn()
      const exemption = new Exemption(buildExemption({
        form2Sent: new Date(),
        applicationPackSent: new Date(),
        applicationFeePaid: new Date(),
        microchipVerification: new Date(),
        neuteringConfirmation: new Date(),
        insurance: [
          buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })
        ]
      }))
      exemption.issueCertificate(auditDate, callback)

      expect(exemption.certificateIssued).toEqual(auditDate)
      expect(exemption.getChanges()).toEqual([{
        key: 'certificateIssued',
        value: auditDate,
        callback
      }])
      expect(() => exemption.getChanges()[0].callback()).not.toThrow()
      expect(callback).toHaveBeenCalled()
    })

    test('should not issue certificate given insurance date in past', () => {
      const callback = jest.fn()
      const yesterday = inXDays(-1)

      const exemption = new Exemption(buildExemption({
        form2Sent: new Date(),
        applicationPackSent: new Date(),
        applicationFeePaid: new Date(),
        microchipVerification: new Date(),
        neuteringConfirmation: new Date(),
        insurance: [
          buildCdoInsurance({
            renewalDate: yesterday,
            company: 'Dogs Trust'
          })
        ]
      }))
      expect(() => exemption.issueCertificate(auditDate, callback)).toThrow(new InvalidDateError('The insurance renewal date must be today or in the future'))

      expect(exemption.certificateIssued).toBeNull()
    })

    test('should not issue certificate given exemption fields not complete', () => {
      const callback = jest.fn()

      const exemption = new Exemption(buildExemption({
        form2Sent: new Date(),
        applicationPackSent: new Date(),
        applicationFeePaid: new Date(),
        neuteringConfirmation: new Date(),
        insurance: [
          buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })
        ]
      }))
      expect(() => exemption.issueCertificate(auditDate, callback)).toThrow(new SequenceViolationError('CDO must be complete in order to issue certificate'))

      expect(exemption.certificateIssued).toBeNull()
    })
  })
})
