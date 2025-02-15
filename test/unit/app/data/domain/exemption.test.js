const Exemption = require('../../../../../app/data/domain/exemption')
const { inXDays } = require('../../../../time-helper')
const { InvalidDateError } = require('../../../../../app/errors/domain/invalidDate')
const { IncompleteDataError } = require('../../../../../app/errors/domain/incompleteData')
const { buildExemption, buildCdoInsurance, buildCdoDog } = require('../../../../mocks/cdo/domain')
const { SequenceViolationError } = require('../../../../../app/errors/domain/sequenceViolation')
const { Dog } = require('../../../../../app/data/domain')
const { ExemptionActionNotAllowedException } = require('../../../../../app/errors/domain/exemptionActionNotAllowedException')

describe('Exemption', () => {
  const exemptionProperties = buildExemption({
    exemptionOrder: '2015',
    cdoIssued: '2023-10-10',
    cdoExpiry: '2023-12-10',
    court: 'Aberystwyth Justice Centre',
    policeForce: 'Avon and Somerset Constabulary',
    legislationOfficer: 'Sidney Lewis',
    insurance: [
      {
        company: 'Allianz',
        renewalDate: '2024-01-01T00:00:00.000Z'
      }
    ],
    joinedExemptionScheme: '2023-12-10'
  })

  const thisMorning = new Date()
  thisMorning.setUTCHours(0, 0, 0, 0)

  const tomorrow = new Date(thisMorning)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const yesterday = new Date(thisMorning)
  yesterday.setUTCMilliseconds(tomorrow.getUTCMilliseconds() - 1)

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
      insuranceCompany: 'Allianz',
      insuranceRenewal: '2024-01-01T00:00:00.000Z',
      insurance: [
        {
          company: 'Allianz',
          renewalDate: '2024-01-01T00:00:00.000Z'
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
      verificationDatesRecorded: null,
      applicationPackProcessed: null
    }))
    expect(exemption).toBeInstanceOf(Exemption)
  })

  test('should create a new exemption', () => {
    const exemption = new Exemption(buildExemption({}))
    expect(exemption.insuranceCompany).toBeUndefined()
    expect(exemption.insuranceRenewal).toBeUndefined()
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

  describe('processApplicationPack', () => {
    const auditDate = new Date()
    test('should set application pack sent', () => {
      const exemption = new Exemption(exemptionProperties)
      exemption.processApplicationPack(auditDate)
      expect(exemption.applicationPackProcessed).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([{
        key: 'applicationPackProcessed',
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

    test('should set form 2 as sent', () => {
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
    const callbackInside = jest.fn()

    const callback = _ => callbackInside

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
            microchipDeadline: null,
            neuteringDeadline: null,
            verificationDatesRecorded: expect.any(Date)
          },
          callback: callbackInside
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
    const cdoIssued = new Date(thisMorning)

    const sixteenMonthsAgo = new Date(thisMorning)
    sixteenMonthsAgo.setUTCMonth(sixteenMonthsAgo.getUTCMonth() - 16)

    const underSixteenMonthsAgo = new Date(sixteenMonthsAgo)
    underSixteenMonthsAgo.setUTCDate(underSixteenMonthsAgo.getUTCDate() + 1)

    const verifyDatesProperties = {
      ...exemptionProperties,
      cdoIssued,
      microchipVerification: null,
      neuteringConfirmation: null
    }

    const dogProperties = buildCdoDog({
      dateOfBirth: underSixteenMonthsAgo
    })

    const defaultDog = new Dog(dogProperties)

    const callback = jest.fn()
    const callbackFn = jest.fn().mockImplementation(_ => callback)

    test('should verifyDates if dates exist', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)
      exemption.verifyDatesWithDeadline({ microchipVerification, neuteringConfirmation }, dog, callbackFn)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation,
            microchipVerification,
            microchipDeadline: null,
            neuteringDeadline: null,
            verificationDatesRecorded: expect.any(Date)
          },
          callback
        }
      ])
      expect(callbackFn).toHaveBeenCalled()
    })

    test('should verifyDates if Dog is under 16 months and neuteringConfirmation is undefined', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)

      const inTwoMonths = new Date(underSixteenMonthsAgo)
      inTwoMonths.setUTCMonth(underSixteenMonthsAgo.getUTCMonth() + 18)

      exemption.verifyDatesWithDeadline({ microchipVerification }, dog, callbackFn)
      expect(exemption.neuteringConfirmation).toBeUndefined()
      expect(exemption.neuteringDeadline).toEqual(inTwoMonths)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            neuteringConfirmation: null,
            microchipVerification,
            microchipDeadline: null,
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

    test('should throw if either date is in the future', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const dog = new Dog(dogProperties)
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification: new Date('9999-01-01'), neuteringConfirmation }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification, neuteringConfirmation: new Date('9999-01-01') }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
    })

    test('should fail if microchip deadline is 23:59:59:999 yesterday', () => {
      const exemption = new Exemption(verifyDatesProperties)

      expect(() => exemption.verifyDatesWithDeadline({ neuteringConfirmation, microchipDeadline: new Date(thisMorning.getTime() - 1) }, defaultDog, callback)).toThrow(new Error('Microchip deadline must be today or in the future'))
    })

    test('should verifyDates for a 2015 Dog if microchipConfirmation is undefined but microchip deadline is today or later', () => {
      const exemption = new Exemption(verifyDatesProperties)
      const microchipDeadlineSubmittedDate = new Date(`${new Date().getUTCFullYear() + 1}-11-01`)
      const expectedMicrochipDeadlineDate = new Date(`${new Date().getUTCFullYear() + 1}-11-29`)

      exemption.verifyDatesWithDeadline({ neuteringConfirmation, microchipDeadline: microchipDeadlineSubmittedDate }, defaultDog, callbackFn)
      expect(exemption.microchipVerification).toBeUndefined()
      expect(exemption.microchipDeadline).toEqual(expectedMicrochipDeadlineDate)
      expect(exemption.verificationDatesRecorded).toEqual(expect.any(Date))
      expect(exemption.getChanges()).toEqual([
        {
          key: 'verificationDateRecorded',
          value: {
            microchipVerification: null,
            neuteringDeadline: null,
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
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification: new Date('9999-01-01'), neuteringConfirmation: undefined }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
      expect(() => exemption.verifyDatesWithDeadline({ microchipVerification: undefined, microchipDeadline: new Date('9999-01-01'), neuteringConfirmation: new Date('9999-01-01') }, dog, callback)).toThrow(new InvalidDateError('Date must be today or in the past'))
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
        verificationDatesRecorded: new Date(),
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

    test('should not issue certificate if renewal date is undefined', () => {
      const callback = jest.fn()
      const exemption = new Exemption(buildExemption({
        form2Sent: new Date(),
        applicationPackSent: new Date(),
        applicationFeePaid: new Date(),
        microchipVerification: new Date(),
        neuteringConfirmation: new Date(),
        verificationDatesRecorded: new Date(),
        insurance: [
          buildCdoInsurance({
            renewalDate: undefined,
            company: 'Dogs Trust'
          })
        ]
      }))
      expect(() => exemption.issueCertificate(auditDate, callback)).toThrow()
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

  describe('verificationComplete', () => {
    test('should be true if Dog if microchipVerification and neuteringConfirmation && verificationDatesRecorded complete', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: new Date(),
        neuteringConfirmation: new Date(),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(true)
    })

    test('should be false if non-2015 Dog if microchipVerification and neuteringConfirmation undefined and verificationDatesRecorded complete', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: undefined,
        microchipDeadline: new Date('9999-10-01'),
        neuteringConfirmation: new Date(),
        verificationDatesRecorded: new Date(),
        exemptionOrder: '2023'
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })

    test('should be true if Dog is under 16 months and neuteringConfirmation is undefined', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: undefined,
        neuteringConfirmation: undefined,
        neuteringDeadline: new Date('9999-10-01'),
        microchipDeadline: new Date('9999-10-01'),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(true)
    })

    test('should be false if neuteringConfirmation is undefined and neuteringDeadline is missing', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: undefined,
        neuteringConfirmation: undefined,
        microchipDeadline: new Date('9999-10-01'),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })

    test('should be false if neuteringDeadline is reached', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: new Date(),
        neuteringConfirmation: undefined,
        neuteringDeadline: new Date(yesterday),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })

    test('should be false if microchipDeadline is reached', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        neuteringConfirmation: new Date(),
        microchipConfirmation: undefined,
        microchipDeadline: new Date(yesterday),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })

    test('should be false if verificationDatesRecorded is missing', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: new Date('9999-10-01'),
        neuteringConfirmation: new Date('9999-10-01'),
        verificationDatesRecorded: undefined
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })

    test('should be false if microchipVerification is undefined and microchip deadline is missing', () => {
      const verifyDatesProperties = {
        ...exemptionProperties,
        microchipVerification: undefined,
        neuteringConfirmation: undefined,
        neuteringDeadline: new Date('9999-10-01'),
        verificationDatesRecorded: new Date()
      }

      const exemption = new Exemption(verifyDatesProperties)

      expect(exemption.verificationComplete).toBe(false)
    })
  })

  describe('setWithdrawn', () => {
    test('should set withdrawn if no withdrawal date exists', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023',
        withdrawn: undefined
      }))
      const timestamp = new Date()
      exemption.setWithdrawn(timestamp)
      expect(exemption.getChanges()).toEqual([
        {
          key: 'withdrawn',
          value: expect.any(Date)
        }
      ])
      expect(exemption.withdrawn).toEqual(timestamp)
    })

    test('should allow action but not update withdrawn date if no withdrawal date exists', () => {
      const withdrawn = new Date('2025-01-23')
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023',
        withdrawn
      }))

      exemption.setWithdrawn(new Date())
      expect(exemption.getChanges().length).toBe(0)
      expect(exemption.withdrawn).toEqual(withdrawn)
    })

    test('should not withdraw a non-2023 dog', () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2015'
      }))
      expect(() => exemption.setWithdrawn(new Date())).toThrow(new ExemptionActionNotAllowedException('Only a 2023 Dog can be withdrawn'))
    })
  })
})
