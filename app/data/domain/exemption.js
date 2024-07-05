const { dateTodayOrInFuture } = require('../../lib/date-helpers')
const { InvalidDateError } = require('../../errors/domain/invalidDate')
const { IncompleteDataError } = require('../../errors/domain/incompleteData')
const { Changeable } = require('./changeable')

/**
 * @param exemptionProperties
 * @constructor
 * @property {string} exemptionOrder
 * @property {Date} cdoIssued
 * @property {Date} cdoExpiry
 * @property {string|null} court
 * @property {string|null} policeForce
 * @property {string|null} legislationOfficer
 * @property {Date|null} certificateIssued
 * @property {Date|null} applicationFeePaid
 * @property {{company: string; renewalDate: Date }[]} insurance
 * @property {Date|null} neuteringConfirmation
 * @property {Date|null} microchipVerification
 * @property {Date} joinedExemptionScheme
 * @property {Date|null} nonComplianceLetterSent
 * @property {Date|null} applicationPackSent
 * @property {Date|null} form2Sent
 */
class Exemption extends Changeable {
  constructor (exemptionProperties) {
    super()
    this.exemptionOrder = exemptionProperties.exemptionOrder
    this.cdoIssued = exemptionProperties.cdoIssued
    this.cdoExpiry = exemptionProperties.cdoExpiry
    this.court = exemptionProperties.court
    this.policeForce = exemptionProperties.policeForce
    this.legislationOfficer = exemptionProperties.legislationOfficer
    this.certificateIssued = exemptionProperties.certificateIssued
    this._applicationFeePaid = exemptionProperties.applicationFeePaid
    this._insurance = exemptionProperties.insurance
    this._neuteringConfirmation = exemptionProperties.neuteringConfirmation
    this._microchipVerification = exemptionProperties.microchipVerification
    this.joinedExemptionScheme = exemptionProperties.joinedExemptionScheme
    this.nonComplianceLetterSent = exemptionProperties.nonComplianceLetterSent
    this.applicationPackSent = exemptionProperties.applicationPackSent
    this._form2Sent = exemptionProperties.form2Sent
  }

  sendApplicationPack (auditDate, callback) {
    this.applicationPackSent = auditDate
    this._updates.update('applicationPackSent', auditDate, callback)
  }

  get insurance () {
    return this._insurance
  }

  get applicationFeePaid () {
    return this._applicationFeePaid
  }

  get form2Sent () {
    return this._form2Sent
  }

  get neuteringConfirmation () {
    return this._neuteringConfirmation
  }

  get microchipVerification () {
    return this._microchipVerification
  }

  /**
   * @param {string} company
   * @param {Date|null} renewalDate
   * @param {() => void} callback
   */
  setInsuranceDetails (company, renewalDate, callback) {
    if (renewalDate instanceof Date && !dateTodayOrInFuture(renewalDate)) {
      throw new InvalidDateError('Insurance renewal date must be in the future')
    }

    const insurance = {
      company: company || undefined,
      renewalDate
    }

    if (insurance.company === undefined && renewalDate instanceof Date) {
      throw new IncompleteDataError('Insurance company must be submitted')
    } else if (renewalDate === undefined && insurance.company !== undefined) {
      throw new IncompleteDataError('Insurance renewal date must be submitted')
    }

    if (insurance.company === undefined && renewalDate === undefined) {
      this._insurance = []
    } else {
      this._insurance = [insurance]
    }

    this._updates.update('insurance', insurance, callback)
  }

  setApplicationFee (applicationFeePaid, callback) {
    const applicationFeePaidDate = new Date(applicationFeePaid)
    applicationFeePaidDate.setUTCHours(0, 0, 0, 0)

    if (applicationFeePaid.getTime() > Date.now()) {
      throw new InvalidDateError('Date must be today or in the past')
    }
    this._applicationFeePaid = applicationFeePaidDate
    this._updates.update('applicationFeePaid', applicationFeePaid, callback)
  }

  sendForm2 (auditDate, callback) {
    this._form2Sent = auditDate
    this._updates.update('form2Sent', auditDate, callback)
  }

  verifyDates (microchipVerification, neuteringConfirmation, callback) {
    if (microchipVerification.getTime() > Date.now() || neuteringConfirmation.getTime() > Date.now()) {
      throw new InvalidDateError('Date must be today or in the past')
    }
    this._microchipVerification = microchipVerification
    this._neuteringConfirmation = neuteringConfirmation
    this._updates.update(
      'verificationDateRecorded',
      {
        microchipVerification,
        neuteringConfirmation
      },
      callback)
  }
}
module.exports = Exemption
