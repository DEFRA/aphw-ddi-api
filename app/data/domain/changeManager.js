class ChangeManager {
  constructor () {
    this._changes = []
  }

  static singleChange (key, value) {
    const changeManager = new ChangeManager()
    changeManager.update(key, value)
    return changeManager
  }

  update (key, value) {
    this._changes.push({ key, value })
    return this
  }

  get changes () {
    return this._changes
  }

  get updatedFields () {
    return this._changes.map(({ key }) => key)
  }

  get bulkChanges () {
    return this._changes.reduce((changeObject, change) => {
      return {
        ...changeObject,
        [change.key]: change.value
      }
    }, {})
  }
}

module.exports = {
  ChangeManager
}
