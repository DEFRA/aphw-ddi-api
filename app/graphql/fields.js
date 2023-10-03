const graphqlFields = require('graphql-fields')

const checkFields = (info, propertyName) => {
  const topLevelFields = Object.keys(graphqlFields(info))
  return topLevelFields.includes(propertyName)
}

module.exports = checkFields
