const { buildExemption, buildCdoInsurance } = require('../../../../mocks/cdo/domain')
const { Exemption } = require('../../../../../app/data/domain')
const { ApplicationPackProcessedRule, ApplicationPackSentRule, InsuranceDetailsRule } = require('../../../../../app/data/domain/cdoTaskList/rules')
describe('CdoTaskList rules', () => {
  const exemptionDefaultProperties = buildExemption({})
  const exemptionDefault = new Exemption(exemptionDefaultProperties)

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
      const processedRule = new InsuranceDetailsRule(exemptionProperties, new ApplicationPackSentRule(exemptionProperties))
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
      const processedRule = new InsuranceDetailsRule(exemptionProperties, new ApplicationPackSentRule(exemptionProperties))
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
      const processedRule = new InsuranceDetailsRule(exemptionProperties, new ApplicationPackSentRule(exemptionProperties))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(false)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toBeUndefined()
    })

    test('should show as complete given insurance renewal date is today', () => {
      const today = new Date()
      today.setHours(0)
      today.setMinutes(0)
      today.setMilliseconds(0)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          renewalDate: today
        })]
      })
      const processedRule = new InsuranceDetailsRule(exemptionProperties, new ApplicationPackSentRule(exemptionProperties))
      expect(processedRule.available).toBe(true)
      expect(processedRule.completed).toBe(true)
      expect(processedRule.readonly).toBe(false)
      expect(processedRule.timestamp).toEqual(new Date('2024-08-07'))
    })
  })
})
