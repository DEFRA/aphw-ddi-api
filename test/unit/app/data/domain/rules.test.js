const { buildExemption } = require('../../../../mocks/cdo/domain')
const { Exemption } = require('../../../../../app/data/domain')
const { ApplicationPackProcessedRule, ApplicationPackSentRule } = require('../../../../../app/data/domain/cdoTaskList/rules')
describe('CdoTaskList rules', () => {
  describe('ApplicationPackSentRule', () => {
    test('should show applicationPackSent in default state', () => {
      const exemptionProperties = buildExemption({})
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new ApplicationPackSentRule(exemption)
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
      const exemptionProperties = buildExemption({})
      const exemption = new Exemption(exemptionProperties)
      const processedRule = new ApplicationPackProcessedRule(exemption, new ApplicationPackSentRule(exemption))
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
})
