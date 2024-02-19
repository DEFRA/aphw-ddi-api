const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { uploadInboundFile } = require('../storage')

const createExportFile = async () => {
  let result = ''

  try {
    const cdos = await getAllCdos()
    const exportedData = convertToCsv(cdos)

    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadInboundFile(str, 'daily_export.csv')

    return `Success Export (${cdos.length} rows)`
  } catch (e) {
    console.log(`Error create export file: ${e}`)
    result = `Error create export file: ${e}`
  }
  return result
}

module.exports = {
  createExportFile
}
