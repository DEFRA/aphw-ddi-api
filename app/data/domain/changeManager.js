class ChangeManager {
  constructor () {
    this._changes = []
  }

  static singleChange (key, value) {
    const changeManager = new ChangeManager()
    changeManager.update(key, value)
    return changeManager
  }

  /**
   *
   * @param key
   * @param value
   * @param [callback]
   * @return {ChangeManager}
   */
  update (key, value, callback) {
    this._changes.push({ key, value, callback })
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
