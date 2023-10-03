const graphql = require('graphql')
const { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLSchema } = graphql
const registerType = require('./registration/register-type')
const registerResolver = require('./registration/register-resolver')

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      register: {
        type: registerType,
        description: 'Get a dog registration by Index Number (required)',
        args: {
          indexNumber: { type: new GraphQLNonNull(GraphQLInt), description: 'Index Number' }
        },
        resolve: (parent, args, context, info) => registerResolver(parent, args, context, info)
      }
    }
  })
})

module.exports = schema
