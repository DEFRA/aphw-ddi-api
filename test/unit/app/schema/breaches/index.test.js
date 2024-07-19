const { setBreachRequestSchema, setBreachResponseSchema } = require('../../../../../app/schema/breaches')
const { buildDogDto, buildBreachDto } = require('../../../../mocks/cdo/dto')
const {
  NOT_COVERED_BY_INSURANCE,
  INSECURE_PLACE,
  AWAY_FROM_ADDR_30_DAYS_IN_YR
} = require('../../../../mocks/cdo/domain')

describe('breaches schema', () => {
  describe('setBreachRequestSchema', () => {
    test('should succeed with a valid payload', () => {
      const payload = {
        indexNumber: 'ED12345',
        dogBreaches: [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ]
      }
      const { value, error } = setBreachRequestSchema.validate(payload)
      expect(value).toEqual({
        indexNumber: 'ED12345',
        dogBreaches: [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ]
      })
      expect(error).toBeUndefined()
    })

    test('should fail with no payload', () => {
      const payload = {}
      const { error } = setBreachRequestSchema.validate(payload)
      expect(error).not.toBeUndefined()
    })

    test('should fail with only indexNumber', () => {
      const payload = {
        indexNumber: 'ED12345'
      }
      const { error } = setBreachRequestSchema.validate(payload)
      expect(error).not.toBeUndefined()
    })

    test('should fail with only dog breaches', () => {
      const payload = {
        dogBreaches: [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ]
      }
      const { error } = setBreachRequestSchema.validate(payload)
      expect(error).not.toBeUndefined()
    })

    test('should fail with empty dog breaches', () => {
      const payload = {
        indexNumber: 'ED12345',
        dogBreaches: []
      }
      const { error } = setBreachRequestSchema.validate(payload)
      expect(error).not.toBeUndefined()
    })
  })

  describe('setBreachResponseSchema', () => {
    test('should return the Dog Dto', () => {
      const payload = buildDogDto({
        breaches: [
          buildBreachDto(NOT_COVERED_BY_INSURANCE),
          buildBreachDto(INSECURE_PLACE),
          buildBreachDto(AWAY_FROM_ADDR_30_DAYS_IN_YR)
        ]
      })
      const { value, error } = setBreachResponseSchema.validate(payload)
      expect(value).toEqual(payload)
      expect(error).toBeUndefined()
    })

    test('should permit additional fields the Dog Dto', () => {
      const payload = {
        ...buildDogDto({
          breaches: [
            buildBreachDto(NOT_COVERED_BY_INSURANCE),
            buildBreachDto(INSECURE_PLACE),
            buildBreachDto(AWAY_FROM_ADDR_30_DAYS_IN_YR)
          ]
        }),
        extraField: true
      }
      const { value, error } = setBreachResponseSchema.validate(payload)
      expect(value).toEqual(payload)
      expect(error).toBeUndefined()
    })
  })
})
