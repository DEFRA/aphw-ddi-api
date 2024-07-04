const { ChangeManager } = require('./changeManager')

class Changeable {
  constructor () {
    this._updates = new ChangeManager()
  }

  getChanges () {
    return this._updates.changes
  }
}

module.exports = { Changeable }
