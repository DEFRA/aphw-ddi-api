const graphql = require('graphql')
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql

const registerType = new GraphQLObjectType({
  name: 'Register',
  fields: () => ({
    indexNumber: { type: GraphQLID, description: 'The unique identifier for the registration' },
    name: { type: GraphQLString, description: 'The name of the dog' },
    birth_date: { type: GraphQLString, description: 'Date of Birth of the dog' },
    tattoo: { type: GraphQLString, description: 'The tattoo number of the dog' },
    microchip_number: { type: GraphQLString, description: 'The microchipnumber of the dog' },
    colour: { type: GraphQLString, description: 'The colour of the dog' },
    sex: { type: GraphQLString, description: 'The sex of the dog' }
  })
})

module.exports = registerType
