const fieldNotNullOrEmpty = fieldVal => {
  return fieldVal && fieldVal !== ''
}

const getFieldValue = (dataRow, fieldName) => {
  if (fieldName.indexOf('.') > -1) {
    return dataRow[fieldName.substr(0, fieldName.indexOf('.'))]?.[fieldName.substr(fieldName.indexOf('.') + 1)]
  }
  return dataRow[fieldName]
}

module.exports = {
  fieldNotNullOrEmpty,
  getFieldValue
}
