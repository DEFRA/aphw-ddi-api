const readXlsxFile = require('read-excel-file/node')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const map = require('./schema/map')
const { baseSchema } = require('./schema')
const config = require('../../config/index')
const { formatDate } = require('../../lib/date-helpers')
const { log } = require('../../lib/import-helper')

const processRows = async (register, sheet, map, schema) => {
  let rows

  const errors = []
  const logBuffer = []

  try {
    const { rows: sheetRows } = await readXlsxFile(register, { sheet, map, dateFormat: 'dd/mm/yyyy' })

    rows = sheetRows
  } catch (err) {
    console.error(`Error reading xlsx file: ${err}`)
    errors.push(`Error reading xlsx file: ${err}`)
  }

  const registerMap = new Map()

  if (!errors.length) {
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1
      const row = rows[i]

      autoCorrectDataValues(row, rowNum, logBuffer)

      replaceUnicodeCharacters(row, logBuffer)

      const result = schema.validate(row)

      if (!result.isValid) {
        if (result.errors.details.length === 1 && result.errors.details[0].message === '"owner.email" must be a valid email') {
          console.log(`IndexNumber ${row.dog.indexNumber} Invalid email ${row.owner.email} - setting to blank`)
          row.owner.email = ''
        } else {
          errors.push(`Row ${rowNum} IndexNumber ${row.dog?.indexNumber} ${concatErrors(result.errors.details)}`)
          continue
        }
      }

      const owner = row.owner
      const dog = row.dog

      if (!owner.birthDate) {
        errors.push(`Row ${rowNum} IndexNumber ${row.dog?.indexNumber} Missing owner birth date`)
        continue
      }

      const key = `${owner.lastName}^${owner.address.postcode}^${owner.birthDate.getDate()}^${owner.birthDate.getMonth()}`

      const value = registerMap.get(key) || { owner, dogs: [] }

      value.dogs.push(dog)

      registerMap.set(key, value)
    }
  }

  const result = {
    add: [...registerMap.values()],
    errors,
    log: logBuffer
  }

  return result
}

const importRegister = async register => {
  const passed = await processRows(register, config.robotSheetName, map, baseSchema)

  return {
    add: [].concat(passed.add),
    errors: [].concat(passed.errors),
    log: [].concat(passed.log)
  }
}

const concatErrors = (errors) => {
  if (errors?.length) {
    return errors.map(x => x.message)
  }
  return errors
}

const truncateIfTooLong = (elem, maxLength, row, colName, logBuffer) => {
  if (elem && elem.length > maxLength) {
    elem = elem.substring(0, maxLength)
    log(logBuffer, `IndexNumber ${row.dog.indexNumber} truncating ${colName} - too long`)
  }
  return elem
}

const autoCorrectDataValues = (row, rowNum, logBuffer) => {
  if (!row.dog) {
    log(logBuffer, `Row ${rowNum} Missing dog fields`)
    return
  }

  row.dog.insuranceStartDate = autoCorrectDate(row.dog.insuranceStartDate)
  row.dog.birthDate = autoCorrectDate(row.dog.birthDate)
  row.dog.name = truncateIfTooLong(row.dog.name, 32, row, 'dogName', logBuffer)
  row.dog.colour = truncateIfTooLong(row.dog.colour, 50, row, 'colour', logBuffer)
  const microchipClean = (row.dog.microchipNumber ? row.dog.microchipNumber : '').toString().replace(/\u0020/g, '').replace(/-/g, '').replace(/\u2013/g, '')
  row.dog.microchipNumber = truncateIfTooLong(microchipClean, 24, row, 'microchipNumber', logBuffer)
  row.dog.certificateIssued = autoCorrectDate(row.dog.certificateIssued)

  if (!row.owner) {
    log(logBuffer, `Row ${rowNum} Missing owner fields`)
    return
  }

  row.owner.birthDate = autoCorrectDate(row.owner.birthDate)
  row.owner.firstName = truncateIfTooLong(row.owner.firstName, 30, row, 'firstName', logBuffer)
  row.owner.lastName = truncateIfTooLong(row.owner.lastName, 24, row, 'lastName', logBuffer)

  if (!row.owner?.address) {
    log(logBuffer, `Row ${rowNum} Missing owner address fields`)
    return
  }

  row.owner.address.town = row.owner.address?.town ?? ' '
  row.owner.address.addressLine1 = truncateIfTooLong(row.owner.address.addressLine1, 50, row, 'addressLine1', logBuffer)
  row.owner.address.addressLine2 = truncateIfTooLong(row.owner.address.addressLine2, 50, row, 'addressLine2', logBuffer)
  row.owner.address.town = truncateIfTooLong(row.owner.address.town, 50, row, 'town', logBuffer)
  row.owner.address.county = truncateIfTooLong(row.owner.address.county, 30, row, 'county', logBuffer)
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

const replaceUnicodeCharacters = (row, logBuffer) => {
  if (!row.dog || !row.owner || !row.owner.address) {
    return
  }
  if (containsNonLatinCodepoints(row.owner.address?.addressLine1)) {
    logReplacement(row.owner.address.addressLine1, row.dog.indexNumber, 'addressLine1', logBuffer)
    row.owner.address.addressLine1 = replaceInvalidCharacters(row.owner.address.addressLine1)
  }
  if (containsNonLatinCodepoints(row.owner.address?.addressLine2)) {
    logReplacement(row.owner.address.addressLine2, row.dog.indexNumber, 'addressLine2', logBuffer)
    row.owner.address.addressLine2 = replaceInvalidCharacters(row.owner.address.addressLine2)
  }
  if (containsNonLatinCodepoints(row.owner.address?.town)) {
    logReplacement(row.owner.address.town, row.dog.indexNumber, 'town', logBuffer)
    row.owner.address.town = replaceInvalidCharacters(row.owner.address.town)
  }
  if (containsNonLatinCodepoints(row.owner.address?.county)) {
    logReplacement(row.owner.address.county, row.dog.indexNumber, 'county', logBuffer)
    row.owner.address.county = replaceInvalidCharacters(row.owner.address.county)
  }
  if (containsNonLatinCodepoints(row.owner.firstName)) {
    logReplacement(row.owner.firstName, row.dog.indexNumber, 'firstName', logBuffer)
    row.owner.firstName = replaceInvalidCharacters(row.owner.firstName)
  }
  if (containsNonLatinCodepoints(row.owner.lastName)) {
    logReplacement(row.owner.lastName, row.dog.indexNumber, 'lastName', logBuffer)
    row.owner.lastName = replaceInvalidCharacters(row.owner.lastName)
  }
  if (containsNonLatinCodepoints(row.dog.name)) {
    logReplacement(row.dog.name, row.dog.indexNumber, 'dogName', logBuffer)
    row.dog.name = replaceInvalidCharacters(row.dog.name)
  }
  if (containsNonLatinCodepoints(row.dog.microchipNumber)) {
    logReplacement(row.dog.microchipNumber, row.dog.indexNumber, 'microchipNumber', logBuffer)
    row.dog.microchipNumber = replaceInvalidCharacters(row.dog.microchipNumber)
  }
}

const logReplacement = (elem, indexNumber, desc, logBuffer) => {
  log(logBuffer, `IndexNumber ${indexNumber} replacing invalid characters in ${desc} with value ${elem}`)
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
  importRegister,
  truncateIfTooLong,
  autoCorrectDate,
  replaceUnicodeCharacters
}
