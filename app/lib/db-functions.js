const dbLogErrorToBacklog = async (row, errorObj) => {
  await row.update({ status: 'PROCESSING_ERROR', errors: errorObj })
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
