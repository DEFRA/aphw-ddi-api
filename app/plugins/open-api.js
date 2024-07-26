const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')

const swaggerOptions = {
  info: {
    title: 'DDI API Documentation',
    description: 'This is the interface for **aphw-ddi-api**.'
  }
}

module.exports = [
  Inert,
  Vision,
  {
    plugin: HapiSwagger,
    options: swaggerOptions
  }
]
