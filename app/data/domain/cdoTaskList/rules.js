const { dateTodayOrInFuture, dateIsADate } = require('../../../lib/date-helpers')

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

/**
 * @implements {CdoTaskRuleInterface}
 */
class InsuranceDetailsRule extends CdoTaskListRule {
  constructor (exemption, applicationPackSent) {
    super('insuranceDetailsRecorded', exemption)
    this._applicationPackSent = applicationPackSent
  }

  get available () {
    return this._applicationPackSent.completed
  }

  get completed () {
    const insuranceRenewal = this._exemption.insuranceRenewal
    const insuranceCompanyIsSet = this._exemption.insuranceCompany !== undefined

    return dateIsADate(insuranceRenewal) &&
        dateIsADate(this._exemption.insuranceDetailsRecorded) &&
        insuranceCompanyIsSet &&
        dateTodayOrInFuture(insuranceRenewal)
  }

  get timestamp () {
    if (this.completed) {
      return this._exemption.insuranceDetailsRecorded
    }
    return undefined
  }

  get readonly () {
    return false
  }
}

/**
 * @implements {CdoTaskRuleInterface}
 */
class ApplicationFeePaymentRule extends CdoTaskListRule {
  /**
   * @param exemption
   * @param {ApplicationPackSentRule} applicationPackSent
   */
  constructor (exemption, applicationPackSent) {
    super('applicationFeePaid', exemption)
    this._applicationPackSent = applicationPackSent
  }

  get available () {
    return this._applicationPackSent.completed
  }

  get completed () {
    return dateIsADate(this._exemption.applicationFeePaid)
  }

  get readonly () {
    return false
  }

  get timestamp () {
    if (this.completed) {
      return this._exemption.applicationFeePaid
    }
    return undefined
  }
}

module.exports = {
  ApplicationPackSentRule,
  ApplicationPackProcessedRule,
  InsuranceDetailsRule,
  ApplicationFeePaymentRule
}
