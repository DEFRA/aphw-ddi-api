const routes = [].concat(
  require('../routes/countries'),
  require('../routes/counties'),
  require('../routes/dog'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/import-access-db'),
  require('../routes/process-backlog'),
  require('../routes/robot-import'),
  require('../routes/person'),
  require('../routes/search-index'),
  require('../routes/police-forces'),
  require('../routes/courts'),
  require('../routes/dog-breeds'),
  require('../routes/cdo'),
  require('../routes/exemption'),
  require('../routes/insurance'),
  require('../routes/export')
  // require('../routes/certificate')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
