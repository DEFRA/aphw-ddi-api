const { closeAllConnections } = require('./messaging/create-message-sender')

require('./insights').setup()
const createServer = require('./server')

createServer()
  .then(server => server.start())
  .catch(err => {
    console.error(err)
    closeAllConnections()
    process.exit(1)
  })
