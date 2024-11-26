const Exemption = require('../../../../../app/data/domain/exemption')
const { inXDays } = require('../../../../time-helper')
const { InvalidDateError } = require('../../../../../app/errors/domain/invalidDate')
const { IncompleteDataError } = require('../../../../../app/errors/domain/incompleteData')
const { buildExemption, buildCdoInsurance, buildCdoDog } = require('../../../../mocks/cdo/domain')
const { SequenceViolationError } = require('../../../../../app/errors/domain/sequenceViolation')
const { Dog } = require('../../../../../app/data/domain')

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
      expect(exemption.applicationFeePaymentRecorded).toBeNull()
    })

    test('should not allow a date in the future', () => {
      expect(() => exemption.setApplicationFee(new Date('9999-01-01'), callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(exemption.applicationFeePaid).toBeNull()
    })

    test('should set application fee', () => {
      const validApplicationFeePaid = new Date('2024-07-04')
      exemption.setApplicationFee(validApplicationFeePaid, callback)
      expect(exemption.applicationFeePaid).toEqual(validApplicationFeePaid)
      expect(exemption.applicationFeePaymentRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'applicationFeePaymentRecorded',
          value: expect.any(Date)
        },
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
      expect(exemption.verificationDatesRecorded).toBeNull()
    })

    test('should verifyDates', () => {
      exemption.verifyDates(microchipVerification, neuteringConfirmation, callback)
      expect(exemption.microchipVerification).toEqual(microchipVerification)
      expect(exemption.neuteringConfirmation).toEqual(neuteringConfirmation)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation,
            microchipVerification,
            verificationDatesRecorded: expect.any(Date)
          },
          callback
        }
      ])
    })

    test('should throw if either date is in the future', () => {
      expect(() => exemption.verifyDates(new Date('9999-01-01'), neuteringConfirmation, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(() => exemption.verifyDates(microchipVerification, new Date('9999-01-01'), callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
    })

    test('should throw if either microchipVerification or neuteringConfirmation is missing', () => {
      const exemption = new Exemption(verifyDatesProperties)
      expect(() => exemption.verifyDates(undefined, neuteringConfirmation, callback)).toThrow(new InvalidDateError('Microchip verification required'))
      expect(() => exemption.verifyDates(microchipVerification, undefined, callback)).toThrow(new InvalidDateError('Neutering confirmation required'))
    })
  })

  describe('verifyDatesWithDeadline', () => {
    const microchipVerification = new Date('2024-07-03')
    const neuteringConfirmation = new Date('2024-07-03')

    const thisMorning = new Date()
    thisMorning.setUTCHours(0, 0, 0, 0)

    const sixteenMonthsAgo = new Date(thisMorning)
    sixteenMonthsAgo.setUTCMonth(sixteenMonthsAgo.getUTCMonth() - 16)

    const underSixteenMonthsAgo = new Date(sixteenMonthsAgo)
    underSixteenMonthsAgo.setUTCDate(underSixteenMonthsAgo.getUTCDate() + 1)

    const verifyDatesProperties = {
      ...exemptionProperties,
      microchipVerification: null,
      neuteringConfirmation: null
    }
    const dogProperties = buildCdoDog({
      dateOfBirth: underSixteenMonthsAgo
    })

    const defaultDog = new Dog(dogProperties)

    const callback = jest.fn()

    test('should verifyDates if dates exist', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)
      exemption.verifyDatesWithDeadline({ microchipVerification, neuteringConfirmation }, dog, callback)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation,
            microchipVerification,
            verificationDatesRecorded: expect.any(Date)
          },
          callback
        }
      ])
    })

    test('should verifyDates if Dog is under 16 months and neuteringConfirmation is undefined', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)

      const inTwoMonths = new Date(underSixteenMonthsAgo)
      inTwoMonths.setUTCMonth(underSixteenMonthsAgo.getUTCMonth() + 18)

      exemption.verifyDatesWithDeadline({ microchipVerification }, dog, callback)
      expect(exemption.neuteringConfirmation).toBeUndefined()
      expect(exemption.neuteringDeadline).toEqual(inTwoMonths)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation: undefined,
            microchipVerification,
            neuteringDeadline: expect.any(Date),
            verificationDatesRecorded: expect.any(Date)
          },
          callback
        }
      ])
    })

    test('should not fail if microchip deadline is 00:00:00 today', () => {
      const exemption = new Exemption(verifyDatesProperties)

      exemption.verifyDatesWithDeadline({ neuteringConfirmation, microchipDeadline: new Date(thisMorning) }, defaultDog, callback)
    })

    test('should fail if microchip deadline is 23:59:59:999 yesterday', () => {
      const exemption = new Exemption(verifyDatesProperties)

      expect(() => exemption.verifyDatesWithDeadline({ neuteringConfirmation, microchipDeadline: new Date(thisMorning.getTime() - 1) }, defaultDog, callback)).toThrow(new Error('Microchip deadline must be today or in the future'))
    })

    test('should verifyDates for a 2015 Dog if microchipConfirmation is undefined but microchip deadline is today or later', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const microchipDeadlineSubmittedDate = new Date(`${new Date().getUTCFullYear() + 1}-11-01`)
      const expectedMicrochipDeadlineDate = new Date(`${new Date().getUTCFullYear() + 1}-11-29`)

      exemption.verifyDatesWithDeadline({ neuteringConfirmation, microchipDeadline: microchipDeadlineSubmittedDate }, defaultDog, callback)
      expect(exemption.microchipVerification).toBeUndefined()
      expect(exemption.microchipDeadline).toEqual(expectedMicrochipDeadlineDate)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            microchipVerification: undefined,
            neuteringConfirmation,
            microchipDeadline: expectedMicrochipDeadlineDate,
            verificationDatesRecorded: expect.any(Date)
          },
          callback
        }
      ])
    })

    test('should throw if neutering confirmation is missing and Dog is not an XL Bully', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const pitBull = new Dog(buildCdoDog({
        ...defaultDog,
        breed: 'Pit Bull Terrier'
      }))

      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification }, pitBull, callback)).toThrow(new Error('Neutering date required for Pit Bull Terrier'))
    })
    test('should throw if neutering confirmation is missing and Dog is sixteen months old or more', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(buildCdoDog({
        dateOfBirth: sixteenMonthsAgo
      }))
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification }, dog, callback)).toThrow(new Error('Neutering confirmation required'))
    })

    test('should throw if neutering confirmation is missing and given undefined dog DOB', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(buildCdoDog({
        dateOfBirth: sixteenMonthsAgo
      }))
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification }, dog, callback)).toThrow(new Error('Neutering confirmation required'))
    })

    test('should throw if microchip verification is missing and no microchip deadline exists', () => {
      const exemption = new Exemption(verifyDatesProperties)
      expect(() => exemption.verifyDatesWithDeadline({ neuteringConfirmation }, defaultDog, callback)).toThrow(new Error('Microchip deadline required'))
    })

    test('should use standard verifyDates if cdo is not 2015', () => {
      const exemption2023 = new Exemption(buildExemption({
        ...verifyDatesProperties,
        exemptionOrder: '2023'
      }))
      const exemption1991 = new Exemption(buildExemption({
        ...verifyDatesProperties,
        exemptionOrder: '1991'
      }))
      const dog = new Dog(dogProperties)
      expect(() => exemption2023.verifyDatesWithDeadline({ microchipVerification }, dog, callback)).toThrow(new Error('Neutering confirmation required'))
      expect(() => exemption1991.verifyDatesWithDeadline({ microchipVerification }, dog, callback)).toThrow(new Error('Neutering confirmation required'))
    })

    test('should throw if either date is in the future', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification: new Date('9999-01-01'), neuteringConfirmation }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification, neuteringConfirmation: new Date('9999-01-01') }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
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

  describe('recordMicrochipNumber', () => {
    test('should update microchip number recorded date', () => {
      const exemption = new Exemption(buildExemption())
      expect(exemption.microchipNumberRecorded).toBeNull()

      exemption.recordMicrochipNumber()
      expect(exemption.microchipNumberRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([{
        key: 'microchipNumberRecorded',
        value: expect.any(Date)
      }])
    })
  })
})
