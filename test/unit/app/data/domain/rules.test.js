const { buildExemption, buildCdoInsurance, buildCdoDog } = require('../../../../mocks/cdo/domain')
const { Exemption, Dog } = require('../../../../../app/data/domain')
const { ApplicationPackProcessedRule, ApplicationPackSentRule, InsuranceDetailsRule, ApplicationFeePaymentRule, FormTwoSentRule, VerificationDatesRecordedRule, SendReplacementCertificateRule } = require('../../../../../app/data/domain/cdoTaskList/rules')
const { inXDays } = require('../../../../time-helper')
describe('CdoTaskList rules', () => {
  const exemptionDefaultProperties = buildExemption({})
  const exemptionDefault = new Exemption(exemptionDefaultProperties)
  const today = new Date()
  const thisMorning = new Date()
  thisMorning.setHours(0, 0, 0, 0)
  const in60Days = inXDays(60)

  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  const sixteenMonthsAgo = new Date(today)
  sixteenMonthsAgo.setUTCHours(0, 0, 0, 0)
  sixteenMonthsAgo.setUTCMonth(today.getMonth() - 16)

  const lessThanSixteenMonthsAgo = new Date(sixteenMonthsAgo)
  lessThanSixteenMonthsAgo.setUTCDate(lessThanSixteenMonthsAgo.getUTCDate() + 1)

  const inTheFuture = new Date(today)
  inTheFuture.setUTCFullYear(inTheFuture.getUTCFullYear() + 1)

  const build6thSiExemption = exemptionPartial => {
    return buildExemption({
      exemptionOrder: '2015',
      applicationPackSent: new Date('2024-06-25'),
      applicationPackProcessed: new Date('2024-06-25'),
      form2Sent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-03-09'),
      microchipVerification: new Date('2024-03-09'),
      insuranceDetailsRecorded: new Date('2024-08-07'),
      microchipNumberRecorded: undefined,
      verificationDatesRecorded: new Date('2024-08-07'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        renewalDate: new Date('2025-06-25')
      })],
      ...exemptionPartial
    })
  }

  const build6thSiDog = dogPartial => {
    return buildCdoDog({
      dateOfBirth: lessThanSixteenMonthsAgo,
      breed: 'XL Bully',
      ...dogPartial
    })
  }

  describe('ApplicationPackSentRule', () => {
    test('should be available by default', () => {
      const processedRule = new ApplicationPackSentRule(exemptionDefault)
      expect(processedRule.key).toBe('applicationPackSent')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBe(undefined)
    })

    test('should show task list given application has been sent', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25')
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new ApplicationPackSentRule(exemption)
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(true)
      expect(processedRule.timestamp).toEqual(new Date('2024-06-25'))
    })
  })

  describe('ApplicationPackProcessedRule', () => {
    test('should show us unavailable by default', () => {
      const processedRule = new ApplicationPackProcessedRule(exemptionDefault, new ApplicationPackSentRule(exemptionDefault))
      expect(processedRule.available).toBe(false)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as available given application pack sent', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25')
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new ApplicationPackProcessedRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.key).toBe('applicationPackProcessed')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as complete given application pack processed', () => {
      const applicationPackProcessed = new Date('2024-06-25')
      const exemptionProperties = buildExemption({
        applicationPackSent: applicationPackProcessed,
        applicationPackProcessed
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new ApplicationPackProcessedRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(true)
      expect(processedRule.timestamp).toEqual(applicationPackProcessed)
    })
  })

  describe('InsuranceDetailsRule', () => {
    test('should show us unavailable by default', () => {
      const processedRule = new InsuranceDetailsRule(exemptionDefault, new ApplicationPackSentRule(exemptionDefault))
      expect(processedRule.key).toBe('insuranceDetailsRecorded')
      expect(processedRule.available).toBe(false)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should not show as complete given insurance renewal date is in the past', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        insuranceDetailsRecorded: yesterday,
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          insuranceRenewal: yesterday
        })]
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new InsuranceDetailsRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should not show as complete given insurance renewal date is null', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 100)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        insuranceDetailsRecorded: null,
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          insuranceRenewal: tomorrow
        })]
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new InsuranceDetailsRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should not show as complete given insurance company not set', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 100)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        insuranceDetailsRecorded: null,
        insurance: [{
          renewalDate: tomorrow
        }]
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new InsuranceDetailsRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as complete given insurance renewal date is today', () => {
      const insuranceDetailsRecorded = new Date('2024-08-07')
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        insuranceDetailsRecorded,
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          renewalDate: thisMorning
        })]
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new InsuranceDetailsRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toEqual(insuranceDetailsRecorded)
    })
  })

  describe('ApplicationFeePaymentRule', () => {
    test('should show us unavailable by default', () => {
      const processedRule = new ApplicationFeePaymentRule(exemptionDefault, new ApplicationPackSentRule(exemptionDefault))
      expect(processedRule.key).toBe('applicationFeePaid')
      expect(processedRule.available).toBe(false)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show us available give application pack has been sent', () => {
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-17')
      }))
      const processedRule = new ApplicationFeePaymentRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show us complete give application fee has been paid application pack has been sent', () => {
      const applicationFeePaid = new Date('2024-12-16')
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-15'),
        applicationFeePaid
      }))
      const processedRule = new ApplicationFeePaymentRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toEqual(applicationFeePaid)
    })
  })

  describe('FormTwoSentRule', () => {
    test('should show us unavailable by default', () => {
      const processedRule = new FormTwoSentRule(exemptionDefault, new ApplicationPackSentRule(exemptionDefault))
      expect(processedRule.key).toBe('form2Sent')
      expect(processedRule.available).toBe(false)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show us available once application pack is sent', () => {
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-17')
      }))
      const processedRule = new FormTwoSentRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.key).toBe('form2Sent')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as complete once form two sent complete', () => {
      const form2Sent = new Date('2024-12-17')
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-16'),
        form2Sent
      }))
      const processedRule = new FormTwoSentRule(exemption, new ApplicationPackSentRule(exemption))
      expect(processedRule.key).toBe('form2Sent')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(true)
      expect(processedRule.timestamp).toEqual(form2Sent)
    })
  })

  describe('VerificationDatesRecordedRule', () => {
    const defaultDog = new Dog(buildCdoDog())
    test('should show as unavailable by default', () => {
      const processedRule = new VerificationDatesRecordedRule(exemptionDefault, defaultDog, new ApplicationPackSentRule(exemptionDefault), new FormTwoSentRule(exemptionDefault))
      expect(processedRule.key).toBe('verificationDateRecorded')
      expect(processedRule.available).toBe(false)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as available if form2 has been sent', () => {
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-15'),
        form2Sent: new Date('2024-12-16')
      }))
      const processedRule = new VerificationDatesRecordedRule(exemption, defaultDog, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
      expect(processedRule.key).toBe('verificationDateRecorded')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as incomplete given microchipVerification complete but neuteringConfirmation not', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        microchipVerification: new Date('2024-03-09'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          insuranceRenewal: in60Days
        })]
      })
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new VerificationDatesRecordedRule(exemption, defaultDog, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as incomplete given neuteringConfirmation complete but microchipVerification not', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          insuranceRenewal: in60Days
        })]
      })
      const dogProperties = buildCdoDog({
        microchipNumber: '123456789012345'
      })
      const dog = new Dog(dogProperties)
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new VerificationDatesRecordedRule(exemption, dog, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))

      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as complete if verification dates have been recorded', () => {
      const verificationDatesRecorded = new Date('2024-12-17')
      const exemption = new Exemption(buildExemption({
        applicationPackSent: new Date('2024-12-15'),
        form2Sent: new Date('2024-12-16'),
        microchipVerification: new Date('2024-12-16'),
        neuteringConfirmation: new Date('2024-12-16'),
        verificationDatesRecorded
      }))
      const dogProperties = buildCdoDog({
        microchipNumber: '123456789012345'
      })
      const dog = new Dog(dogProperties)

      const processedRule = new VerificationDatesRecordedRule(exemption, dog, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
      expect(processedRule.key).toBe('verificationDateRecorded')
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toEqual(verificationDatesRecorded)
    })

    describe('neuteringRulesPassed', () => {
      const dog6thSi = new Dog(build6thSiDog())

      test('should pass if deadline is tomorrow', () => {
        const exemption = new Exemption(build6thSiExemption({
          neuteringConfirmation: undefined,
          neuteringDeadline: tomorrow
        }))

        const processedRule = new VerificationDatesRecordedRule(exemption, dog6thSi, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
        expect(processedRule.neuteringRulesPassed).toBe(true)
      })

      test('should not pass if deadline is today', () => {
        const exemption = new Exemption(build6thSiExemption({
          neuteringConfirmation: undefined,
          neuteringDeadline: today
        }))
        const processedRule = new VerificationDatesRecordedRule(exemption, dog6thSi, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
        expect(processedRule.neuteringRulesPassed).toBe(false)
      })
    })

    describe('microchipRulesPassed', () => {
      const dog6thSi = new Dog(build6thSiDog())

      test('should pass if deadline is tomorrow', () => {
        const exemption = new Exemption(build6thSiExemption({
          microchipVerification: undefined,
          microchipDeadline: tomorrow
        }))
        const processedRule = new VerificationDatesRecordedRule(exemption, dog6thSi, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
        expect(processedRule.microchipRulesPassed).toBe(true)
      })

      test('should not pass if deadline is today', () => {
        const exemption = new Exemption(build6thSiExemption({
          microchipVerification: undefined,
          microchipDeadline: today
        }))
        const processedRule = new VerificationDatesRecordedRule(exemption, dog6thSi, new ApplicationPackSentRule(exemption), new FormTwoSentRule(exemption))
        expect(processedRule.microchipRulesPassed).toBe(false)
      })
    })
  })

  describe('SendReplacementCertificateRule', () => {
    test('should allow certificate to be sent', () => {
      const dog = buildCdoDog({
        status: 'Exempt'
      })
      const certificateIssued = new Date()
      const exemption = buildExemption({
        certificateIssued
      })
      const resendCertificateRule = new SendReplacementCertificateRule(exemption, dog)
      expect(resendCertificateRule.completed).toBe(true)
      expect(resendCertificateRule.available).toBe(true)
      expect(resendCertificateRule.readonly).toBe(false)
      expect(resendCertificateRule.timestamp).toBe(certificateIssued)
    })

    test('should not allow certificate to be resent if status is not Interim Exempt', () => {
      const dog = buildCdoDog({
        status: 'Failed'
      })
      const certificateIssued = new Date()
      const exemption = buildExemption({
        certificateIssued
      })
      const resendCertificateRule = new SendReplacementCertificateRule(exemption, dog)
      expect(resendCertificateRule.completed).toBe(true)
      expect(resendCertificateRule.available).toBe(false)
      expect(resendCertificateRule.timestamp).toBe(certificateIssued)
    })

    test('should not allow certificate to be resent if it has not been sent', () => {
      const dog = buildCdoDog({
        status: 'Interim exempt'
      })
      const exemption = buildExemption({
        certificateIssued: undefined
      })
      const resendCertificateRule = new SendReplacementCertificateRule(exemption, dog)
      expect(resendCertificateRule.completed).toBe(false)
      expect(resendCertificateRule.available).toBe(false)
      expect(resendCertificateRule.timestamp).toBe(undefined)
    })
  })
})
