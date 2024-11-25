const { dateTodayOrInFuture } = require('../../lib/date-helpers')
const { InvalidDateError } = require('../../errors/domain/invalidDate')
const { IncompleteDataError } = require('../../errors/domain/incompleteData')
const { Changeable } = require('./changeable')
const { InvalidDataError } = require('../../errors/domain/invalidData')

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
 * @property {Date|null} neuteringDeadline
 * @property {Date|null} microchipVerification
 * @property {Date} joinedExemptionScheme
 * @property {Date|null} nonComplianceLetterSent
 * @property {Date|null} applicationPackSent
 * @property {Date|null} form2Sent
 * @property {Date|null} insuranceDetailsRecorded
 * @property {Date|null} microchipNumberRecorded
 * @property {Date|null} applicationFeePaymentRecorded
 * @property {Date|null} verificationDatesRecorded
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
    this._certificateIssued = exemptionProperties.certificateIssued
    this._applicationFeePaid = exemptionProperties.applicationFeePaid
    this._insurance = exemptionProperties.insurance
    this._neuteringDeadline = exemptionProperties.neuteringDeadline
    this._neuteringConfirmation = exemptionProperties.neuteringConfirmation
    this._microchipVerification = exemptionProperties.microchipVerification
    this._microchipDeadline = exemptionProperties.microchipDeadline
    this.joinedExemptionScheme = exemptionProperties.joinedExemptionScheme
    this.nonComplianceLetterSent = exemptionProperties.nonComplianceLetterSent
    this.applicationPackSent = exemptionProperties.applicationPackSent
    this._form2Sent = exemptionProperties.form2Sent
    this._insuranceDetailsRecorded = exemptionProperties.insuranceDetailsRecorded
    this._microchipNumberRecorded = exemptionProperties.microchipNumberRecorded
    this._applicationFeePaymentRecorded = exemptionProperties.applicationFeePaymentRecorded
    this._verificationDatesRecorded = exemptionProperties.verificationDatesRecorded
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

  get neuteringDeadline () {
    return this._neuteringDeadline
  }

  get microchipVerification () {
    return this._microchipVerification
  }

  get microchipDeadline () {
    return this._microchipDeadline
  }

  get certificateIssued () {
    return this._certificateIssued
  }

  get insuranceDetailsRecorded () {
    return this._insuranceDetailsRecorded
  }

  get microchipNumberRecorded () {
    return this._microchipNumberRecorded
  }

  get applicationFeePaymentRecorded () {
    return this._applicationFeePaymentRecorded
  }

  get verificationDatesRecorded () {
    return this._verificationDatesRecorded
  }

  _checkIfInsuranceIsValid () {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const insuranceRenewalDate = this._insurance[0]?.renewalDate ?? new Date(0)

    return insuranceRenewalDate.getTime() >= today.getTime()
  }

  _exemptionIsComplete () {
    return this.form2Sent instanceof Date &&
      this.applicationPackSent instanceof Date &&
      this.applicationFeePaid instanceof Date &&
      this.microchipVerification instanceof Date &&
      this.neuteringConfirmation instanceof Date &&
      this._checkIfInsuranceIsValid()
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
    const timestamp = new Date()
    this._insuranceDetailsRecorded = timestamp

    this._updates.update('insuranceDetailsRecorded', timestamp)
    this._updates.update('insurance', insurance, callback)
  }

  setApplicationFee (applicationFeePaid, callback) {
    const applicationFeePaidDate = new Date(applicationFeePaid)
    applicationFeePaidDate.setUTCHours(0, 0, 0, 0)

    if (applicationFeePaid.getTime() > Date.now()) {
      throw new InvalidDateError('Date must be today or in the past')
    }
    const timestamp = new Date()
    this._applicationFeePaid = applicationFeePaidDate
    this._applicationFeePaymentRecorded = timestamp
    this._updates.update('applicationFeePaymentRecorded', timestamp)
    this._updates.update('applicationFeePaid', applicationFeePaid, callback)
  }

  sendForm2 (auditDate, callback) {
    this._form2Sent = auditDate
    this._updates.update('form2Sent', auditDate, callback)
  }

  // TODO: This shouldn't verify dates if neuteringConfirmation does not exist
  // TODO: Create a new method that takes a dog (if Dog is 2015 it can bypass)
  verifyDates (microchipVerification, neuteringConfirmation, callback) {
    if (microchipVerification.getTime() > Date.now() || neuteringConfirmation.getTime() > Date.now()) {
      throw new InvalidDateError('Date must be today or in the past')
    }
    const verificationDatesRecorded = new Date()
    this._microchipVerification = microchipVerification
    this._neuteringConfirmation = neuteringConfirmation
    this._verificationDatesRecorded = verificationDatesRecorded
    this._updates.update(
      'verificationDateRecorded',
      {
        microchipVerification,
        neuteringConfirmation,
        verificationDatesRecorded
      },
      callback)
  }

  issueCertificate (certificateIssued, callback) {
    if (!this._checkIfInsuranceIsValid()) {
      throw new InvalidDateError('The insurance renewal date must be today or in the future')
    }

    if (!this._exemptionIsComplete()) {
      throw new InvalidDataError('CDO must be complete in order to issue certificate')
    }

    this._certificateIssued = certificateIssued
    this._updates.update(
      'certificateIssued',
      certificateIssued,
      callback
    )
  }

  recordMicrochipNumber () {
    const timestamp = new Date()
    this._microchipNumberRecorded = timestamp
    this._updates.update('microchipNumberRecorded', timestamp)
  }
}
module.exports = Exemption
