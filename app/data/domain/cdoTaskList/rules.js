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
 * @extends {CdoTaskListRule}
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

/**
 * @implements {CdoTaskRuleInterface}
 */
class FormTwoSentRule extends CdoTaskListRule {
  /**
   * @param exemption
   * @param {ApplicationPackSentRule} applicationPackSent
   */
  constructor (exemption, applicationPackSent) {
    super('form2Sent', exemption)
    this._applicationPackSent = applicationPackSent
  }

  get available () {
    return this._applicationPackSent.completed
  }

  get completed () {
    return dateIsADate(this._exemption.form2Sent)
  }

  get readonly () {
    return this.completed
  }

  get timestamp () {
    if (this.completed) {
      return this._exemption.form2Sent
    }

    return undefined
  }
}

/**
 * @implements {CdoTaskRuleInterface}
 */
class VerificationDatesRecordedRule extends CdoTaskListRule {
  /**
   * @param {Exemption} exemption
   * @param {Dog} dog
   * @param {ApplicationPackSentRule} applicationPackSent
   * @param {FormTwoSentRule} form2Sent
   */
  constructor (exemption, dog, applicationPackSent, form2Sent) {
    super('verificationDateRecorded', exemption)
    this._applicationPackSent = applicationPackSent
    this._form2Sent = form2Sent
    this._dog = dog
  }

  get available () {
    return this._form2Sent.completed
  }

  get neuteringRulesPassed () {
    if (this._exemption.exemptionOrder !== '2015') {
      return false
    }

    if (!dateIsADate(this._exemption.verificationDatesRecorded)) {
      return false
    }

    if (this._dog.breed !== 'XL Bully') {
      return false
    }

    // Date of Birth must be less than 16 months ago
    if (!this._dog.youngerThanSixteenMonthsAtDate(this._exemption.cdoIssued)) {
      return false
    }

    if (!dateIsADate(this._exemption.neuteringDeadline)) {
      return false
    }

    // Neutering deadline > today
    return Date.now() < this._exemption.neuteringDeadline
  }

  get microchipRulesPassed () {
    if (this._exemption.exemptionOrder !== '2015') {
      return false
    }

    if (!dateIsADate(this._exemption.verificationDatesRecorded)) {
      return false
    }

    if (!dateIsADate(this._exemption.microchipDeadline)) {
      return false
    }

    // Microchip deadline > yesterday
    return Date.now() < this._exemption.microchipDeadline.getTime()
  }

  get completed () {
    let neuteringRulesPassed = this.neuteringRulesPassed
    let microchipRulesPassed = this.microchipRulesPassed

    if (dateIsADate(this._exemption.microchipVerification)) {
      microchipRulesPassed = true
    }

    if (dateIsADate(this._exemption.neuteringConfirmation)) {
      neuteringRulesPassed = true
    }

    return neuteringRulesPassed && microchipRulesPassed
  }

  get readonly () {
    return false
  }

  get timestamp () {
    if (this.completed) {
      return this._exemption.verificationDatesRecorded
    }
    return undefined
  }
}

module.exports = {
  ApplicationPackSentRule,
  ApplicationPackProcessedRule,
  InsuranceDetailsRule,
  ApplicationFeePaymentRule,
  FormTwoSentRule,
  VerificationDatesRecordedRule
}
