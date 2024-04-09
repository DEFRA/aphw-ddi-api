const { truncateIfTooLong, autoCorrectDate, replaceUnicodeCharacters } = require('../../../../../app/import/robot/importer')

describe('Importer tests', () => {
  test('should truncate if too long', async () => {
    const res = truncateIfTooLong('test string', 6, { dog: { indexNumber: 123 } }, 'col1')
    expect(res).toBe('test s')
  })

  test('should not truncate if not too long', async () => {
    const res = truncateIfTooLong('test string', 15, { dog: { indexNumber: 123 } }, 'col1')
    expect(res).toBe('test string')
  })

  test('autoCorrect returns null', async () => {
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

  test('replaceUnicode replaces chars', async () => {
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

    replaceUnicodeCharacters(clonedBadRow)
    expect(clonedBadRow).toEqual(cleansedRow)
  })
})
