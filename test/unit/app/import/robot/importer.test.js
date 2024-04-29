const { truncateIfTooLong, autoCorrectDate, replaceUnicodeCharacters, autoCorrectDataValues, concatErrors, checkErrorDetails } = require('../../../../../app/import/robot/importer')

describe('Importer tests', () => {
  describe('truncateIfTooLong', () => {
    test('should truncate if too long', async () => {
      const res = truncateIfTooLong('test string', 6, { dog: { indexNumber: 123 } }, 'col1', [])
      expect(res).toBe('test s')
    })

    test('should not truncate if not too long', async () => {
      const res = truncateIfTooLong('test string', 15, { dog: { indexNumber: 123 } }, 'col1', [])
      expect(res).toBe('test string')
    })
  })

  describe('autoCorrectDate', () => {
    test('returns null', async () => {
      const res = autoCorrectDate(null)
      expect(res).toBe(null)
    })

    test('autoCorrect returns date from date', async () => {
      const res = autoCorrectDate(new Date(2000, 1, 1))
      expect(res).toEqual(new Date(2000, 1, 1))
    })

    test('autoCorrect returns date from string', async () => {
      const res = autoCorrectDate('02/03/2002')
      expect(res).toEqual(new Date(2002, 2, 2))
    })

    test('autoCorrect returns date from string with missing century', async () => {
      const res = autoCorrectDate('02/03/0002')
      expect(res).toEqual(new Date(2002, 2, 2))
    })
  })

  describe('replaceUnicodeCharacters', () => {
    test('replaces chars', async () => {
      const badRow = {
        owner: {
          firstName: String.fromCharCode(150),
          lastName: String.fromCharCode(150),
          address: {
            addressLine1: String.fromCharCode(150),
            addressLine2: String.fromCharCode(150),
            town: String.fromCharCode(150),
            county: String.fromCharCode(150)
          }
        },
        dog: {
          name: String.fromCharCode(150),
          indexNumber: 'ED123',
          microchipNumber: String.fromCharCode(150)
        }
      }

      const cleansedRow = {
        owner: {
          firstName: '',
          lastName: '',
          address: {
            addressLine1: '',
            addressLine2: '',
            town: '',
            county: ''
          }
        },
        dog: {
          name: '',
          indexNumber: 'ED123',
          microchipNumber: ''
        }
      }

      const clonedBadRow = JSON.parse(JSON.stringify(badRow))

      replaceUnicodeCharacters(clonedBadRow, [])
      expect(clonedBadRow).toEqual(cleansedRow)
    })

    test('aborts when no dog', async () => {
      const badRow = {}

      const replacements = []

      replaceUnicodeCharacters(badRow, replacements)
      expect(replacements).toEqual([])
    })

    test('aborts when no address', async () => {
      const badRow = { dog: {} }

      const replacements = []

      replaceUnicodeCharacters(badRow, replacements)
      expect(replacements).toEqual([])
    })
  })

  describe('autoCorrectDataValues', () => {
    test('aborts if no address', async () => {
      const logBuffer = []
      autoCorrectDataValues({ dog: {}, owner: {} }, 1, logBuffer)
      expect(logBuffer).toHaveLength(1)
      expect(logBuffer[0]).toBe('Row 1 Missing owner address fields')
    })
  })

  describe('concatErrors', () => {
    test('handles no errors', async () => {
      const errors = []
      const res = concatErrors(errors)
      expect(res).toHaveLength(0)
    })

    test('handles errors', async () => {
      const errors = [{ message: 'line1' }, { message: 'line2' }]
      const res = concatErrors(errors)
      expect(res).toHaveLength(2)
      expect(res[0]).toBe('line1')
      expect(res[1]).toBe('line2')
    })
  })

  describe('checkErrorDetails', () => {
    test('handles valid result', async () => {
      const result = { isValid: true }
      const errors = []
      const row = { owner: { birthDate: '01/01/2000' } }
      checkErrorDetails(result, row, 1, errors)
      expect(errors).toHaveLength(0)
    })

    test('handles missing owner DOB', async () => {
      const result = { isValid: true }
      const errors = []
      const row = { owner: { birthDate: null } }
      checkErrorDetails(result, row, 1, errors)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toBe('Row 1 IndexNumber undefined Missing owner birth date')
    })

    test('handles invalid email', async () => {
      const result = { isValid: false, errors: { details: [{ message: '"owner.email" must be a valid email' }] } }
      const errors = []
      const logBuffer = []
      const row = { owner: { birthDate: '01/01/2000' }, dog: { indexNumber: 'ED123' } }
      checkErrorDetails(result, row, 1, errors, logBuffer)
      expect(logBuffer).toHaveLength(1)
      expect(logBuffer[0]).toBe('IndexNumber ED123 Invalid email undefined - setting to blank')
      expect(errors).toHaveLength(0)
    })

    test('handles other errors', async () => {
      const result = { isValid: false, errors: { details: [{ message: 'Field xyz is missing' }] } }
      const errors = []
      const logBuffer = []
      const row = { owner: { birthDate: '01/01/2000' }, dog: { indexNumber: 'ED123' } }
      checkErrorDetails(result, row, 1, errors, logBuffer)
      expect(logBuffer).toHaveLength(0)
      expect(errors).toHaveLength(1)
      expect(errors[0]).toBe('Row 1 IndexNumber ED123 Field xyz is missing')
    })
  })
})
