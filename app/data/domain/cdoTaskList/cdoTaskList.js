const CdoTask = require('./cdoTask')
const { ActionAlreadyPerformedError } = require('../../../errors/domain/actionAlreadyPerformed')
const { SequenceViolationError } = require('../../../errors/domain/sequenceViolation')
const {
  ApplicationPackSentRule, ApplicationPackProcessedRule, InsuranceDetailsRule, ApplicationFeePaymentRule,
  FormTwoSentRule, VerificationDatesRecordedRule
} = require('./rules')

class CdoTaskList {
  /**
   * @param {Cdo} cdo
   */
  constructor (cdo) {
    this._cdo = cdo
    const applicationPackSentRule = new ApplicationPackSentRule(this._cdo.exemption, this._cdo.dog)
    const applicationPackProcessedRule = new ApplicationPackProcessedRule(this._cdo.exemption, applicationPackSentRule)
    const insuranceDetailsRule = new InsuranceDetailsRule(this._cdo.exemption, applicationPackSentRule)
    const applicationFeePaymentRule = new ApplicationFeePaymentRule(this._cdo.exemption, applicationPackSentRule)
    const formTwoSentRule = new FormTwoSentRule(this._cdo.exemption, applicationPackSentRule)
    const verificationDatesRecordedRule = new VerificationDatesRecordedRule(this._cdo.exemption, this._cdo.dog, applicationPackSentRule, formTwoSentRule)

    this.rules = {
      applicationPackSentRule,
      applicationPackProcessedRule,
      insuranceDetailsRule,
      applicationFeePaymentRule,
      formTwoSentRule,
      verificationDatesRecordedRule
    }
  }

  static dateStageComplete (stage) {
    return stage instanceof Date
  }

  get exemption () {
    return this._cdo.exemption
  }

  /**
   * @return {Person}
   */
  get person () {
    return this._cdo.person
  }

  /**
   * @return {Dog}
   */
  get dog () {
    return this._cdo.dog
  }

  get _actionPackStageComplete () {
    return this.rules.applicationPackSentRule.completed
  }

  get _form2StageComplete () {
    return this.rules.formTwoSentRule.completed
  }

  _actionPackCompleteGuard () {
    if (!this._actionPackStageComplete) {
      throw new SequenceViolationError('Application pack must be sent before performing this action')
    }
  }

  _form2CompleteGuard () {
    if (!this._form2StageComplete) {
      throw new SequenceViolationError('Form 2 must be sent before performing this action')
    }
  }

  get _preCertificateMicrochipStageComplete () {
    if (this.microchipRulesPassed && this.cdoSummary) {
      return true
    }
    return this.microchipNumberRecorded.completed
  }

  get _preCertificateStepsComplete () {
    return this.applicationPackSent.completed &&
      this.applicationPackProcessed.completed &&
      this.insuranceDetailsRecorded.completed &&
      this._preCertificateMicrochipStageComplete &&
      this.applicationFeePaid.completed &&
      this.form2Sent.completed &&
      this.verificationDateRecorded.completed
  }

  get cdoSummary () {
    let microchipNumber
    let microchipNumber2

    if (this._cdo.dog.microchipNumber !== null) {
      microchipNumber = `${this._cdo.dog.microchipNumber}`.length > 0 ? this._cdo.dog.microchipNumber : undefined
    }

    if (this._cdo.dog.microchipNumber2 !== null) {
      microchipNumber2 = `${this._cdo.dog.microchipNumber2}`.length > 0 ? this._cdo.dog.microchipNumber2 : undefined
    }

    return {
      id: this._cdo.dog.id,
      indexNumber: this._cdo.dog.indexNumber,
      applicationPackSent: this._cdo.exemption.applicationPackSent ?? undefined,
      applicationPackProcessed: this._cdo.exemption.applicationPackProcessed ?? undefined,
      insuranceCompany: this._cdo.exemption.insurance[0]?.company ?? undefined,
      insuranceRenewal: this._cdo.exemption.insurance[0]?.renewalDate ?? undefined,
      microchipNumber,
      microchipNumber2,
      applicationFeePaid: this._cdo.exemption.applicationFeePaid ?? undefined,
      form2Sent: this._cdo.exemption.form2Sent ?? undefined,
      form2Submitted: this._cdo.exemption.form2Submitted ?? undefined,
      neuteringConfirmation: this._cdo.exemption.neuteringConfirmation ?? undefined,
      neuteringDeadline: this._cdo.exemption.neuteringDeadline ?? undefined,
      microchipVerification: this._cdo.exemption.microchipVerification ?? undefined,
      microchipDeadline: this._cdo.exemption.microchipDeadline ?? undefined,
      certificateIssued: this._cdo.exemption.certificateIssued ?? undefined,
      status: this._cdo.dog.status,
      dogName: this._cdo.dog.name,
      cdoExpiry: this._cdo.exemption.cdoExpiry,
      ownerFirstName: this._cdo.person.firstName,
      ownerLastName: this._cdo.person.lastName,
      ownerEmail: this._cdo.person.contactDetails.email,
      addressLine1: this._cdo.person.contactDetails.addressLine1,
      addressLine2: this._cdo.person.contactDetails.addressLine2,
      town: this._cdo.person.contactDetails.town,
      postcode: this._cdo.person.contactDetails.postcode
    }
  }

  get applicationPackSent () {
    return this.rules.applicationPackSentRule
  }

  get applicationPackProcessed () {
    return this.rules.applicationPackProcessedRule
  }

  get insuranceDetailsRecorded () {
    return this.rules.insuranceDetailsRule
  }

  get microchipNumberRecorded () {
    let timestamp

    const completed = this.cdoSummary.microchipNumber !== undefined

    if (completed) {
      timestamp = this._cdo.exemption.microchipNumberRecorded
    }

    return new CdoTask(
      'microchipNumberRecorded',
      {
        available: this._actionPackStageComplete,
        completed
      },
      timestamp
    )
  }

  get applicationFeePaid () {
    return this.rules.applicationFeePaymentRule
  }

  get form2Sent () {
    return this.rules.formTwoSentRule
  }

  get neuteringRulesPassed () {
    return this.rules.verificationDatesRecordedRule.neuteringRulesPassed
  }

  get microchipRulesPassed () {
    return this.rules.verificationDatesRecordedRule.microchipRulesPassed
  }

  get verificationDateRecorded () {
    return this.rules.verificationDatesRecordedRule
  }

  get verificationOptions () {
    if (this._cdo.exemption.exemptionOrder !== '2015') {
      return {
        dogDeclaredUnfit: false,
        neuteringBypassedUnder16: false,
        allowDogDeclaredUnfit: false,
        allowNeuteringBypass: false,
        showNeuteringBypass: false
      }
    }

    let dogDeclaredUnfit = this.verificationDateRecorded.completed
    let neuteringBypassedUnder16 = this.verificationDateRecorded.completed
    let showNeuteringBypass = this._cdo.dog.youngerThanSixteenMonthsAtDate(this._cdo.exemption.cdoIssued) !== false

    if (this._cdo.exemption.microchipVerification instanceof Date) {
      dogDeclaredUnfit = false
    }

    if (this._cdo.exemption.neuteringConfirmation instanceof Date) {
      neuteringBypassedUnder16 = false
    }

    if (!this.microchipRulesPassed) {
      dogDeclaredUnfit = false
    }

    if (!this.neuteringRulesPassed) {
      neuteringBypassedUnder16 = false
    }

    if (this._cdo.dog.breed !== 'XL Bully') {
      showNeuteringBypass = false
    }

    return {
      dogDeclaredUnfit,
      neuteringBypassedUnder16,
      allowDogDeclaredUnfit: true,
      allowNeuteringBypass: showNeuteringBypass && this._cdo.dog.youngerThanSixteenMonthsAtDate(this._cdo.exemption.cdoIssued) === true,
      showNeuteringBypass
    }
  }

  get certificateIssued () {
    const completed = CdoTaskList.dateStageComplete(this.cdoSummary.certificateIssued)
    return new CdoTask(
      'certificateIssued',
      {
        available: this._preCertificateStepsComplete && !completed,
        completed
      },
      this.cdoSummary.certificateIssued
    )
  }

  sendApplicationPack (sentDate, callback) {
    if (this.applicationPackSent.completed) {
      throw new ActionAlreadyPerformedError('Application pack can only be sent once')
    }
    this._cdo.exemption.sendApplicationPack(sentDate, callback)
  }

  emailApplicationPack (sentDate, callback) {
    this._cdo.exemption.sendApplicationPack(sentDate, callback)
  }

  postApplicationPack (sentDate, callback) {
    this._cdo.exemption.sendApplicationPack(sentDate, callback)
  }

  processApplicationPack (sentDate, callback) {
    this._actionPackCompleteGuard()
    if (this.applicationPackProcessed.completed) {
      throw new ActionAlreadyPerformedError('Application pack can only be processed once')
    }
    this._cdo.exemption.processApplicationPack(sentDate, callback)
  }

  recordInsuranceDetails (company, renewalDate, callback) {
    this._actionPackCompleteGuard()
    this._cdo.exemption.setInsuranceDetails(company, renewalDate, callback)
  }

  recordMicrochipNumber (microchipNumber1, duplicateMicrochipNumber, callback) {
    if (!this.microchipNumberRecorded.completed) {
      this._actionPackCompleteGuard()
    }
    this._cdo.exemption.recordMicrochipNumber()
    this._cdo.dog.setMicrochipNumber(microchipNumber1, duplicateMicrochipNumber, callback)
  }

  recordApplicationFee (applicationFeePaid, callback) {
    this._actionPackCompleteGuard()
    this._cdo.exemption.setApplicationFee(applicationFeePaid, callback)
  }

  sendForm2 (sentDate, callback) {
    this._actionPackCompleteGuard()

    if (this.form2Sent.completed) {
      throw new ActionAlreadyPerformedError('Form 2 can only be sent once')
    }

    this._cdo.exemption.sendForm2(sentDate, callback)
  }

  /**
   *
   * @param {{
   *    microchipVerification?: Date|undefined;
   *    neuteringConfirmation?: Date|undefined;
   *    neuteringDeadline?: Date|undefined
   *    dogNotFitForMicrochip?: true|undefined;
   *    dogNotNeutered?: true|undefined
   * }} dateVerfication
   * @param neuteringConfirmation
   * @param callback
   * @return {void}
   */
  verifyDates ({
    microchipVerification,
    neuteringConfirmation,
    dogNotFitForMicrochip,
    dogNotNeutered,
    microchipDeadline
  }, callback) {
    this._actionPackCompleteGuard()
    this._form2CompleteGuard()

    if (dogNotFitForMicrochip || dogNotNeutered) {
      return this._cdo.exemption.verifyDatesWithDeadline({ microchipVerification, neuteringConfirmation, microchipDeadline }, this._cdo.dog, callback)
    }

    return this._cdo.exemption.verifyDates(microchipVerification, neuteringConfirmation, callback)
  }

  issueCertificate (certificateIssued, callback) {
    if (!this._preCertificateStepsComplete) {
      throw new SequenceViolationError('CDO must be complete in order to issue certificate')
    }
    this._cdo.exemption.issueCertificate(certificateIssued)
    this._cdo.dog.setStatus('Exempt', callback)
  }

  getUpdates () {
    return {
      exemption: this._cdo.exemption.getChanges(),
      dog: this._cdo.dog.getChanges(),
      person: []
    }
  }
}

module.exports = CdoTaskList
