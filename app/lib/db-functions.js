const dbLogErrorToBacklog = async (row, errorObj) => {
  const newStatus = row.status.startsWith('PROCESSED') ? `${row.status} then PROCESSING_ERROR` : 'PROCESSING_ERROR'
  if (typeof errorObj === 'object') {
    const errors = []
    errorObj.forEach(e => errors.push(!e.message ? e : e.message))
    const errorText = errors.join(', ')
    await row.update({ status: newStatus, errors: errorText })
  } else {
    await row.update({ status: newStatus, errors: errorObj })
  }
}

const dbLogWarningToBacklog = async (row, warningText) => {
  await row.update({ warnings: row.warnings ? `${row.warnings} ${warningText}` : warningText })
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

const dbCreate = async (model, entity, options) => {
  return await model.create(entity, options)
}

const dbDelete = async (model, options) => {
  return await model.destroy(options)
}

module.exports = {
  dbLogErrorToBacklog,
  dbLogWarningToBacklog,
  dbFindAll,
  dbFindOne,
  dbUpdate,
  dbCreate,
  dbDelete
}
