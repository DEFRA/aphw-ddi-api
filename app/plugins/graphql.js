const Graphi = require('graphi')
const schema = require('../graphql/registration-schema')

module.exports = {
  plugin: Graphi,
  options: {
    schema
  }
}
