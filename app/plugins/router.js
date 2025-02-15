require('../data')

const routes = [].concat(
  require('../routes/attachments'),
  require('../routes/countries'),
  require('../routes/counties'),
  require('../routes/dog'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/robot-import'),
  require('../routes/person'),
  require('../routes/persons'),
  require('../routes/search-index'),
  require('../routes/police-forces'),
  require('../routes/courts'),
  require('../routes/dog-breeds'),
  require('../routes/cdo'),
  require('../routes/cdos'),
  require('../routes/exemption'),
  require('../routes/insurance'),
  require('../routes/export'),
  require('../routes/activities'),
  require('../routes/regular-jobs'),
  require('../routes/jobs'),
  require('../routes/statistics'),
  require('../routes/breaches'),
  require('../routes/user')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
