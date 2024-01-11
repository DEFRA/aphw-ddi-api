const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const { dbLogWarningToBacklog } = require('../../../lib/db-functions')

const dateFormats = ['D MMMM YYYY', 'DD MMMM YYYY', 'DD/MM/YYYY']

const breedTransforms = [
  { in: 'Pit Bull Terrier Type', out: 'Pit Bull Terrier', caseInsensitive: true }
]
const policeForceTransforms = [
  { in: 'Cheshire Police', out: 'Cheshire Constabulary' },
  { in: 'Cumbria Police', out: 'Cumbria Constabulary' },
  { in: 'Devon and Cornwall Constabulary', out: 'Devon and Cornwall Police' },
  { in: 'Leicestershire Constabulary', out: 'Leicestershire Police' },
  { in: 'Dumfries & Galloway Police', out: 'Dumfries and Galloway Constabulary' }
]

const cleanseRow = async (rowObj) => {
  const rowJson = rowObj.dataValues.json
  rowJson.breed = transformProperty(rowJson.breed, breedTransforms)
  rowJson.policeForce = transformProperty(rowJson.policeForce, policeForceTransforms)
  rowJson.person_date_of_birth = await extractPersonDateOfBirth(rowJson, rowObj)
  return rowJson
}

const transformProperty = (prop, transforms) => {
  if (prop) {
    for (const transform of transforms) {
      if (transform.caseInsensitive ? prop.toLowerCase() === transform.in.toLowerCase() : prop === transform.in) {
        return transform.out
      }
    }
  }
  return prop
}

const extractPersonDateOfBirth = async (rowJson, rowObj) => {
  const bornPosStart = rowJson.comments ? rowJson.comments.toLowerCase().indexOf('born:') : -1
  if (bornPosStart === -1) {
    return undefined
  }
  const bornPosEnd = rowJson.comments.indexOf('\n', bornPosStart + 1)
  const bornField = rowJson.comments.substring(bornPosStart + 5, bornPosEnd === -1 ? rowJson.comments.length : bornPosEnd).trim()
  const parsedDate = parseDate(bornField)
  if (!parsedDate) {
    await dbLogWarningToBacklog(rowObj, `Invalid 'person DOB' value of '${bornField}'`)
  }
  return parsedDate
}

const parseDate = (dateStr) => {
  if (dateStr == null || dateStr === '') {
    return undefined
  }
  dateStr = dateStr.replace('  ', ' ')
  for (const format of dateFormats) {
    if (dayjs(dateStr, format, true).isValid()) {
      return dayjs(dateStr, format).toDate()
    }
  }
  return undefined
}

module.exports = {
  cleanseRow,
  extractPersonDateOfBirth
}
