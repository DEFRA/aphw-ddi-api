const graphqlFields = require('graphql-fields')

const checkArgs = (info, propertyName) => {
  const fieldsWithSubFieldsArgs = graphqlFields(info, {}, { processArguments: true })
  const args = fieldsWithSubFieldsArgs[propertyName]?.__arguments
  if (args) {
    return args.map(arg => {
      const keyName = Object.keys(arg)[0]
      return { [keyName]: arg[keyName].value }
    })
  }

  return []
}

module.exports = checkArgs
