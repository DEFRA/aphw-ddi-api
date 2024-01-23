const readXlsxFile = require('read-excel-file/node')
const map = require('./schema/map')
const { baseSchema } = require('./schema')
const config = require('../../config/index')
const { lookupPoliceForceByPostcode } = require('./police')
const getPoliceForce = require('../../lookups/police-force')

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
    const result = schema.validate(row)

    if (!result.isValid) {
      errors.push({ rowNum, row, errors: result.errors.details })
      continue
    }

    const owner = row.owner
    const dog = row.dog

    const forceId = await lookupPoliceForce(owner.address.postcode)

    if (!forceId) {
      console.log(`RowNum ${rowNum} error: Cannot find police force for postcode ${owner.address.postcode}`)
    } else {
      owner.policeForceId = forceId
    }

    const key = `${owner.lastName}^${owner.postcode}^${owner.birthDate.getDate()}`

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

const lookupPoliceForce = async (postcode) => {
  const policeForce = await lookupPoliceForceByPostcode(postcode.replace(' ', ''))

  if (policeForce) {
    const force = await getPoliceForce(policeForce.name)

    if (force) {
      return force.id
    }
  }

  return null
}

module.exports = {
  importRegister
}
