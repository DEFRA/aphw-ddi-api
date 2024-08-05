const debugValidation = (schema, dto) => {
  const { error } = schema.validate(dto)
  console.log('~~~~~~ Debug ~~~~~~ ', 'Validation error:', error)
}

module.exports = {
  debugValidation
}
