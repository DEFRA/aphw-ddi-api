const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const HapiSwagger = require('hapi-swagger')

const swaggerOptions = {
  info: {
    title: 'Test API Documentation',
    description: 'This is a sample example of API documentation.'
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
