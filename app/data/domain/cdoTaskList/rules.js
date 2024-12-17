class CdoTaskListRule {
  /**
   * @param {string} key
   * @param {Exemption} exemption
   */
  constructor (key, exemption) {
    this.key = key
    this._exemption = exemption
  }
}

/**
 * @implements {CdoTaskRuleInterface}
 */
class ApplicationPackSentRule extends CdoTaskListRule {
  constructor (exemption) {
    super('applicationPackSent', exemption)
  }

  get available () { return true }

  get completed () {
    return !!this._exemption.applicationPackSent
  }

  get readonly () {
    return this.completed
  }

  get timestamp () {
    return this._exemption.applicationPackSent ?? undefined
  }
}

/**
 * @implements {CdoTaskRuleInterface}
 */
class ApplicationPackProcessedRule extends CdoTaskListRule {
  /**
   * @param {Exemption} exemption
   * @param {ApplicationPackSentRule} applicationPackSent
   */
  constructor (exemption, applicationPackSent) {
    super('applicationPackProcessed', exemption)
    this._applicationPackSent = applicationPackSent
  }

  get available () {
    return this._applicationPackSent.completed
  }

  get completed () {
    return !!this._exemption.applicationPackProcessed
  }

  get readonly () {
    return this.completed
  }

  get timestamp () {
    return this._exemption.applicationPackProcessed ?? undefined
  }
}

module.exports = {
  ApplicationPackSentRule,
  ApplicationPackProcessedRule
}
