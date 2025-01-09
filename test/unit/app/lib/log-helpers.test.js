const { schemaDebug } = require('../../../../app/lib/log-helpers')
const Joi = require('joi')
const { ValidationError } = require('joi')

describe('log-helpers', () => {
  describe('schemaDebug', () => {
    const schema = Joi.object({ test: Joi.boolean().required() }).required()

    test('should do nothing if schema is valid', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      schemaDebug(schema, { test: true })
      expect(logSpy).not.toHaveBeenCalled()
      logSpy.mockRestore()
    })

    test('should log an error is schema is invalid', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      schemaDebug(schema, {})
      expect(logSpy).toHaveBeenCalledWith('Schema validation failed', new ValidationError('"test" is required'))
      logSpy.mockRestore()
    })
  })
})
