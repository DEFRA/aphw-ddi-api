const dbLogErrorToBacklog = async (row, errorObj) => {
  const newStatus = row.status.startsWith('PROCESSED') ? `${row.status} then PROCESSING_ERROR` : 'PROCESSING_ERROR'
  await row.update({ status: newStatus, errors: errorObj })
}

const dbFindAll = async (model, options) => {
  return await model.findAll(options)
}

const dbFindOne = async (model, options) => {
  return await model.findOne(options)
}

const dbUpdate = async (row, options) => {
  return await row.update(options)
}

module.exports = {
  dbLogErrorToBacklog,
  dbFindAll,
  dbFindOne,
  dbUpdate
}
