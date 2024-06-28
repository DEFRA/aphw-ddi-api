const { func } = require('joi')
const { ChangeManager } = require('./changeManager')

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
 * @property {{company: string; insuranceRenewal: Date }[]} insurance
 * @property {Date|null} neuteringConfirmation
 * @property {Date|null} microchipVerification
 * @property {Date} joinedExemptionScheme
 * @property {Date|null} nonComplianceLetterSent
 * @property {Date|null} applicationPackSent
 * @property {Date|null} formTwoSent
 */
function Exemption (exemptionProperties) {
  this._updates = new ChangeManager()
  this.exemptionOrder = exemptionProperties.exemptionOrder
  this.cdoIssued = exemptionProperties.cdoIssued
  this.cdoExpiry = exemptionProperties.cdoExpiry
  this.court = exemptionProperties.court
  this.policeForce = exemptionProperties.policeForce
  this.legislationOfficer = exemptionProperties.legislationOfficer
  this.certificateIssued = exemptionProperties.certificateIssued
  this.applicationFeePaid = exemptionProperties.applicationFeePaid
  this.insurance = exemptionProperties.insurance
  this.neuteringConfirmation = exemptionProperties.neuteringConfirmation
  this.microchipVerification = exemptionProperties.microchipVerification
  this.joinedExemptionScheme = exemptionProperties.joinedExemptionScheme
  this.nonComplianceLetterSent = exemptionProperties.nonComplianceLetterSent
  this.applicationPackSent = exemptionProperties.applicationPackSent
  this.formTwoSent = exemptionProperties.formTwoSent
}

Exemption.prototype.sendApplicationPack = function () {
  const auditDate = new Date()
  this.applicationPackSent = auditDate
  this._updates.update('applicationPackSent', auditDate)
}

Exemption.prototype.getBulkChanges = function () {
  return this._updates.bulkChanges
}

module.exports = Exemption
