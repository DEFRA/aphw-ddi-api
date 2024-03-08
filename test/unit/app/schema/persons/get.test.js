const { personsFilter } = require('../../../../../app/schema/persons/get')

describe('getPersons schema', () => {
  test('should validate given no filters are passed', () => {
    const queryParams = {}
    const validation = personsFilter.validate(queryParams, { abortEarly: false })

    expect(validation).toEqual({ value: {} })
    expect(validation.error).not.toBeDefined()
  })

  test('should validate given all filters are passed', () => {
    const queryParams = {
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: '2000-01-01'
    }
    const expectedQueryParams = {
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: new Date('2000-01-01')
    }
    const validation = personsFilter.validate(queryParams, { abortEarly: false })

    expect(validation).toEqual({ value: expectedQueryParams })
    expect(validation.error).not.toBeDefined()
  })

  test('should validate given all filters are passed with null values', () => {
    const queryParams = {
      firstName: null,
      lastName: null,
      dateOfBirth: null
    }
    const validation = personsFilter.validate(queryParams, { abortEarly: false })

    expect(validation).toEqual({ value: queryParams })
    expect(validation.error).toBeUndefined()
  })

  test('should validate given string filters are passed with empty strings', () => {
    const queryParams = {
      firstName: '',
      lastName: ''
    }
    const validation = personsFilter.validate(queryParams, { abortEarly: false })

    expect(validation).toEqual({ value: queryParams })
    expect(validation.error).toBeUndefined()
  })

  test('should validate given some filters are passed', () => {
    const queryParams = {
      firstName: 'firstName',
      lastName: 'lastName'
    }

    const validation = personsFilter.validate(queryParams, { abortEarly: false })
    expect(validation).toEqual({ value: queryParams })
    expect(validation.error).toBeUndefined()
  })

  test('should not validate if unknown filters are passed', () => {
    const queryParams = {
      firstName: 'firstName',
      lastName: 'lastName',
      unknown: 'something'
    }

    const validation = personsFilter.validate(queryParams, { abortEarly: false })
    expect(validation.error.message).toEqual('"unknown" is not allowed')
  })

  test('should not validate if date is invalid', () => {
    const queryParams = {
      dateOfBirth: '20000-13-1'
    }

    const validation = personsFilter.validate(queryParams, { abortEarly: false })
    expect(validation.error.message).toEqual('"dateOfBirth" must be in ISO 8601 date format')
  })
})
