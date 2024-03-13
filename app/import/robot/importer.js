const readXlsxFile = require('read-excel-file/node')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const map = require('./schema/map')
const { baseSchema } = require('./schema')
const config = require('../../config/index')
const { formatDate } = require('../../lib/date-helpers')

const processRows = async (register, sheet, map, schema) => {
  let rows

  try {
    const { rows: sheetRows } = await readXlsxFile(register, { sheet, map, dateFormat: 'dd/mm/yyyy' })

    rows = sheetRows
  } catch (err) {
    console.error(`Error reading xlsx file: ${err}`)

    throw err
  }

  const errors = []

  const registerMap = new Map()

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1
    const row = rows[i]

    autoCorrectDataValues(row)

    replaceUnicodeCharacters(row)

    const result = schema.validate(row)

    if (!result.isValid) {
      if (result.errors.details.length === 1 && result.errors.details[0].message === '"owner.email" must be a valid email') {
        console.log(`IndexNumber ${row.dog.indexNumber} Invalid email ${row.owner.email} - setting to blank`)
        row.owner.email = ''
      } else {
        errors.push({ rowNum, row, errors: result.errors.details })
        continue
      }
    }

    const owner = row.owner
    const dog = row.dog

    const key = `${owner.lastName}^${owner.address.postcode}^${owner.birthDate.getDate()}^${owner.birthDate.getMonth()}`

    const value = registerMap.get(key) || { owner, dogs: [] }

    value.dogs.push(dog)

    registerMap.set(key, value)
  }

  const result = {
    add: [...registerMap.values()],
    errors
  }

  return result
}

const importRegister = async register => {
  const passed = await processRows(register, config.robotSheetName, map, baseSchema)

  return {
    add: [].concat(passed.add),
    errors: [].concat(passed.errors)
  }
}

const truncateIfTooLong = (elem, maxLength, row, colName) => {
  if (elem && elem.length > maxLength) {
    elem = elem.substring(0, maxLength)
    console.log(`IndexNumber ${row.dog.indexNumber} truncating ${colName} - too long`)
  }
  return elem
}

const autoCorrectDataValues = (row) => {
  row.dog.insuranceStartDate = autoCorrectDate(row.dog.insuranceStartDate)
  row.dog.birthDate = autoCorrectDate(row.dog.birthDate)
  row.owner.address.town = row.owner.address?.town ?? ' '
  row.owner.birthDate = autoCorrectDate(row.owner.birthDate)
  row.dog.name = truncateIfTooLong(row.dog.name, 32, row, 'dogName')
  row.dog.colour = truncateIfTooLong(row.dog.colour, 50, row, 'colour')
  const microchipClean = (row.dog.microchipNumber ? row.dog.microchipNumber : '').toString().replace(/\u0020/g, '').replace(/-/g, '').replace(/\u2013/g, '')
  row.dog.microchipNumber = truncateIfTooLong(microchipClean, 24, row, 'microchipNumber')
  row.owner.address.addressLine1 = truncateIfTooLong(row.owner.address.addressLine1, 50, row, 'addressLine1')
  row.owner.address.addressLine2 = truncateIfTooLong(row.owner.address.addressLine2, 50, row, 'addressLine2')
  row.owner.address.town = truncateIfTooLong(row.owner.address.town, 50, row, 'town')
  row.owner.address.county = truncateIfTooLong(row.owner.address.county, 30, row, 'county')
  row.owner.firstName = truncateIfTooLong(row.owner.firstName, 30, row, 'firstName')
  row.owner.lastName = truncateIfTooLong(row.owner.lastName, 24, row, 'lastName')
  row.dog.certificateIssued = autoCorrectDate(row.dog.certificateIssued)
}

const autoCorrectDate = (inDate) => {
  if (!inDate) {
    return null
  }
  if (typeof inDate === 'object') {
    inDate = formatDate(inDate)
  }
  if (inDate.length === 10 && inDate.substring(6, 8) === '00') {
    const newDate = `${inDate.substring(0, 6)}20${inDate.substring(8, 10)}`
    if (dayjs(newDate, 'DD/MM/YYYY', true).isValid()) {
      return dayjs(newDate, 'DD/MM/YYYY').toDate()
    }
  }
  return dayjs(inDate, 'DD/MM/YYYY').toDate()
}

const replaceUnicodeCharacters = (row) => {
  if (containsNonLatinCodepoints(row.owner.address?.addressLine1)) {
    logReplacement(row.owner.address.addressLine1, row.dog.indexNumber, 'addressLine1')
    row.owner.address.addressLine1 = replaceInvalidCharacters(row.owner.address.addressLine1)
  }
  if (containsNonLatinCodepoints(row.owner.address?.addressLine2)) {
    logReplacement(row.owner.address.addressLine2, row.dog.indexNumber, 'addressLine2')
    row.owner.address.addressLine2 = replaceInvalidCharacters(row.owner.address.addressLine2)
  }
  if (containsNonLatinCodepoints(row.owner.address?.town)) {
    logReplacement(row.owner.address.town, row.dog.indexNumber, 'town')
    row.owner.address.town = replaceInvalidCharacters(row.owner.address.town)
  }
  if (containsNonLatinCodepoints(row.owner.address?.county)) {
    logReplacement(row.owner.address.county, row.dog.indexNumber, 'county')
    row.owner.address.county = replaceInvalidCharacters(row.owner.address.county)
  }
  if (containsNonLatinCodepoints(row.owner.firstName)) {
    logReplacement(row.owner.firstName, row.dog.indexNumber, 'firstName')
    row.owner.firstName = replaceInvalidCharacters(row.owner.firstName)
  }
  if (containsNonLatinCodepoints(row.owner.lastName)) {
    logReplacement(row.owner.lastName, row.dog.indexNumber, 'lastName')
    row.owner.lastName = replaceInvalidCharacters(row.owner.lastName)
  }
  if (containsNonLatinCodepoints(row.dog.name)) {
    logReplacement(row.dog.name, row.dog.indexNumber, 'dogName')
    row.dog.name = replaceInvalidCharacters(row.dog.name)
  }
  if (containsNonLatinCodepoints(row.dog.microchipNumber)) {
    logReplacement(row.dog.microchipNumber, row.dog.indexNumber, 'microchipNumber')
    row.dog.microchipNumber = replaceInvalidCharacters(row.dog.microchipNumber)
  }
}

const logReplacement = (elem, indexNumber, desc) => {
  console.log(`IndexNumber ${indexNumber} replacing invalid characters in ${desc} with value ${elem}`)
}

const replaceInvalidCharacters = (elem) => {
  return elem.replace(/\u2019/g, '\'')
    .replace(/\u2013/g, '-')
    .replace(/\u202c/g, '')
    .replace(/[\u201c\u201d\u2018]/g, '"')
    .replace(/[\u00e1\u00e3\u00e0]/g, 'a')
    .replace(/\u00c5/g, 'A')
    .replace(/[\u010d\u00e7]/g, 'c')
    .replace(/[\u00e8\u00e9\u00eb]/g, 'e')
    .replace(/\u00c9/g, 'E')
    .replace(/[\u00ed\u00ef]/g, 'i')
    .replace(/\u0142/g, 'l')
    .replace(/[\u00f3\u00f4\u00f8]/g, 'o')
    .replace(/[\u00d6\u00d8]/g, 'O')
    .replace(/[\u00fa\u00fc]/g, 'u')
    .replace(/\u017b/g, 'Z')
    .replace(/[\u0080-\uFFFF]/g, '')
}

const containsNonLatinCodepoints = (str, log) => {
  if (!str) {
    return false
  }
  for (let i = 0, n = str.length; i < n; i++) {
    if (str.charCodeAt(i) > 127) {
      if (log) {
        console.log('Char code:', str.charCodeAt(i))
        console.log('str', str)
      }
      return true
    }
  }
  return false
}

module.exports = {
  importRegister
}
