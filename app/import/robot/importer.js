const readXlsxFile = require('read-excel-file/node')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const map = require('./schema/map')
const { baseSchema } = require('./schema')
const config = require('../../config/index')

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
  row.dog.microchipNumber = truncateIfTooLong(row.dog.microchipNumber, 24, row, 'microchipNumber')
  row.owner.address.addressLine1 = truncateIfTooLong(row.owner.address.addressLine1, 50, row, 'addressLine1')
  row.owner.address.addressLine2 = truncateIfTooLong(row.owner.address.addressLine2, 50, row, 'addressLine2')
  row.owner.address.town = truncateIfTooLong(row.owner.address.town, 50, row, 'town')
  row.owner.address.county = truncateIfTooLong(row.owner.address.county, 30, row, 'county')
  row.owner.firstName = truncateIfTooLong(row.owner.firstName, 30, row, 'firstName')
  row.owner.lastName = truncateIfTooLong(row.owner.lastName, 24, row, 'lastName')
}

const autoCorrectDate = (inDate) => {
  if (inDate.length === 10 && inDate.substring(6, 8) === '00') {
    const newDate = `${inDate.substring(0, 6)}20${inDate.substring(8, 10)}`
    if (dayjs(newDate, 'DD/MM/YYYY', true).isValid()) {
      return dayjs(newDate, 'DD/MM/YYYY').toDate()
    }
  }
  return inDate
}

module.exports = {
  importRegister
}
