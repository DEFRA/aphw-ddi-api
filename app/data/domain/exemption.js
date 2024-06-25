/**
 * @param exemptionProperties
 * @constructor
 */
function Exemption (exemptionProperties) {
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

module.exports = Exemption
