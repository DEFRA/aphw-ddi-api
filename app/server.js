require('./insights').setup()
const Hapi = require('@hapi/hapi')

const server = Hapi.server({
  port: process.env.PORT
})

const routes = [].concat(
  require('./routes/countries'),
  require('./routes/counties'),
  require('./routes/dog'),
  require('./routes/healthy'),
  require('./routes/healthz'),
  require('./routes/person')
)

server.route(routes)

module.exports = server
