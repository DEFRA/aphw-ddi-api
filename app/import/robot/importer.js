const readXlsxFile = require('read-excel-file/node')
const map = require('./schema/map')
const { baseSchema } = require('./schema')

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

  rows.forEach((row, index) => {
    const rowNum = index + 1

    const result = schema.validate(row)

    if (!result.isValid) {
      return errors.push({ rowNum, row, errors: result.errors.details })
    }

    const owner = row.owner
    const dog = row.dog

    const key = `${owner.lastName}^${owner.postcode}^${owner.birthDate.getDate()}`

    const value = registerMap.get(key) || { owner, dogs: [] }

    value.dogs.push(dog)

    registerMap.set(key, value)
  })

  const result = {
    add: [...registerMap.values()],
    errors
  }

  return result
}

const importRegister = async register => {
  const passed = await processRows(register, 'Wall-E', map, baseSchema)

  return {
    add: [].concat(passed.add),
    errors: [].concat(passed.errors)
  }
}

module.exports = {
  importRegister
}
