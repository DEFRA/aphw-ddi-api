class ChangeManager {
  constructor () {
    /**
     * @type {{key: string; value: any; callback: () => any}[]}
     * @private
     */
    this._changes = []
  }

  static singleChange (key, value, callback) {
    const changeManager = new ChangeManager()
    changeManager.update(key, value, callback)
    return changeManager
  }

  /**
   *
   * @param {string} key
   * @param value
   * @param {(function(): *)} [callback]
   * @return {ChangeManager}
   */
  update (key, value, callback) {
    this._changes.push({ key, value, callback })
    return this
  }

  /**
   * @return {{key: string, value: *, callback: (function(): *)}[]}
   */
  get changes () {
    return this._changes
  }

  get updatedFields () {
    return this._changes.map(({ key }) => key)
  }
}

module.exports = {
  ChangeManager
}
