const routes = [].concat(
  require('../routes/countries'),
  require('../routes/counties'),
  require('../routes/dog'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/person')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
