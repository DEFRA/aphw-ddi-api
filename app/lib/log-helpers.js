const schemaDebug = (schema, payload) => {
  const { error } = schema.validate(payload)

  if (error) {
    console.log('Payload failed schema validation', payload)
    console.error('Schema validation failed', error)
  }
}

module.exports = {
  schemaDebug
}
