const schema = require('./email-schema')

const validateEmail = (email) => {
  const validate = schema.validate(email)
  if (validate.error) {
    console.error('Invalid email', validate.error)
    return false
  }
  return true
}

module.exports = {
  validateEmail
}
