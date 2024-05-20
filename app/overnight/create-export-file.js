const { limitStringLength } = require('../lib/string-helpers')
const { getAllCdos } = require('../repos/cdo')
const { convertToCsv } = require('../export/csv')
const { uploadExportedFile } = require('../../app/storage/repos/export')
const { updateRunningJobProgress } = require('../repos/regular-jobs')

const createExportFile = async (rowsPerBatch, jobId) => {
  rowsPerBatch = rowsPerBatch ?? 0

  let tryNum = 1
  while (true) {
    const res = await tryCreateExportFile(rowsPerBatch, jobId, tryNum)

    if (tryNum >= 3 || res?.startsWith('Success')) {
      return `${res} - try ${tryNum}`
    }

    tryNum++
  }
}

const tryCreateExportFile = async (rowsPerBatch, jobId, tryNum) => {
  try {
    await updateRunningJobProgress(jobId, `Try ${tryNum} rows `)

    const { exportedData, numRowsExported } = await generateCsv(rowsPerBatch, jobId)

    const Readable = require('stream').Readable
    const str = new Readable()
    str.push(exportedData)
    str.push(null)

    await uploadExportedFile(str, 'daily_export.csv')

    return `Success Export (${numRowsExported} rows, batches of ${rowsPerBatch})`
  } catch (e) {
    console.log('Error create export file', e)
    await updateRunningJobProgress(jobId, `Try ${tryNum} Error create export file: ${limitStringLength(e.stack, 180)}`)
    return `Error create export file: ${limitStringLength(e.stack, 180)}`
  }
}

const generateCsv = async (rowsPerBatch, jobId) => {
  if (!rowsPerBatch || rowsPerBatch === '0') {
    return generateCsvAltogether()
  }

  return generateCsvInBatches(rowsPerBatch, jobId)
}

const generateCsvAltogether = async () => {
  const allCdos = await getAllCdos()
  return {
    exportedData: convertToCsv(allCdos),
    numRowsExported: allCdos.length
  }
}

const generateCsvInBatches = async (rowsPerBatch, jobId) => {
  let csvSoFar = ''
  let latestDogId = 1
  let numReturnedRows = 0
  let totalRows = 0
  let isNotFirstLoopIteration = false

  do {
    const cdoBatch = await getAllCdos(latestDogId, rowsPerBatch)
    numReturnedRows = cdoBatch.length
    if (numReturnedRows > 0) {
      latestDogId = cdoBatch[numReturnedRows - 1].id + 1
      csvSoFar = csvSoFar + convertToCsv(cdoBatch, isNotFirstLoopIteration)
      totalRows += numReturnedRows
      isNotFirstLoopIteration = true
      console.log(`Rows ${numReturnedRows} jobId ${jobId}`)
      await updateRunningJobProgress(jobId, `${numReturnedRows}`)
    }
  } while (numReturnedRows > 0)

  return {
    exportedData: csvSoFar,
    numRowsExported: totalRows
  }
}

module.exports = {
  createExportFile,
  tryCreateExportFile
}
