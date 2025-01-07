const schemaDebug = (schema, payload) => {
  const { error, ...all } = schema.validate(payload)
  console.log('~~~~~~ Chris Debug ~~~~~~ ', 'All', all)
  if (error) {
    console.error('Schema validation failed', error)
  }
}

module.exports = {
  schemaDebug
}
