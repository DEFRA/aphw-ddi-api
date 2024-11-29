const CdoTask = require('./cdoTask')
const { ActionAlreadyPerformedError } = require('../../errors/domain/actionAlreadyPerformed')
const { SequenceViolationError } = require('../../errors/domain/sequenceViolation')
const { dateTodayOrInFuture } = require('../../lib/date-helpers')

class CdoTaskList {
  /**
   * @param {Cdo} cdo
   */
  constructor (cdo) {
    this._cdo = cdo
  }

  static dateStageComplete (stage) {
    return stage instanceof Date
  }

  get exemption () {
    return this._cdo.exemption
  }

  get person () {
    return this._cdo.person
  }

  get dog () {
    return this._cdo.dog
  }

  get _actionPackStageComplete () {
    return this.applicationPackSent.completed
  }

  get _form2StageComplete () {
    return this.form2Sent.completed
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
    this.insuranceDetailsRecorded.completed &&
    this._preCertificateMicrochipStageComplete &&
    this.applicationFeePaid.completed &&
    this.form2Sent.completed &&
    this.verificationDateRecorded.completed
  }

  get cdoSummary () {
    let microchipNumber

    if (this._cdo.dog.microchipNumber !== null) {
      microchipNumber = `${this._cdo.dog.microchipNumber}`.length > 0 ? this._cdo.dog.microchipNumber : undefined
    }

    return {
      id: this._cdo.dog.id,
      indexNumber: this._cdo.dog.indexNumber,
      applicationPackSent: this._cdo.exemption.applicationPackSent ?? undefined,
      insuranceCompany: this._cdo.exemption.insurance[0]?.company ?? undefined,
      insuranceRenewal: this._cdo.exemption.insurance[0]?.renewalDate ?? undefined,
      microchipNumber,
      applicationFeePaid: this._cdo.exemption.applicationFeePaid ?? undefined,
      form2Sent: this._cdo.exemption.form2Sent ?? undefined,
      neuteringConfirmation: this._cdo.exemption.neuteringConfirmation ?? undefined,
      neuteringDeadline: this._cdo.exemption.neuteringDeadline ?? undefined,
      microchipVerification: this._cdo.exemption.microchipVerification ?? undefined,
      microchipDeadline: this._cdo.exemption.microchipDeadline ?? undefined,
      certificateIssued: this._cdo.exemption.certificateIssued ?? undefined,
      status: this._cdo.dog.status,
      dogName: this._cdo.dog.name,
      cdoExpiry: this._cdo.exemption.cdoExpiry,
      ownerFirstName: this._cdo.person.firstName,
      ownerLastName: this._cdo.person.lastName
    }
  }

  get applicationPackSent () {
    const timestamp = this._cdo.exemption.applicationPackSent ?? undefined
    const completed = timestamp !== undefined

    return new CdoTask(
      'applicationPackSent',
      {
        available: true,
        completed,
        readonly: completed
      },
      timestamp
    )
  }

  get insuranceDetailsRecorded () {
    const completed =
      this.cdoSummary.insuranceCompany !== undefined &&
      CdoTaskList.dateStageComplete(this.cdoSummary.insuranceRenewal) &&
      dateTodayOrInFuture(this.cdoSummary.insuranceRenewal)

    let timestamp

    if (completed) {
      timestamp = this._cdo.exemption.insuranceDetailsRecorded
    }

    return new CdoTask(
      'insuranceDetailsRecorded',
      {
        available: this._actionPackStageComplete,
        completed
      },
      timestamp
    )
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
    let timestamp
    const completed = CdoTaskList.dateStageComplete(this.cdoSummary.applicationFeePaid)

    if (completed) {
      timestamp = this._cdo.exemption.applicationFeePaymentRecorded
    }
    return new CdoTask(
      'applicationFeePaid',
      {
        available: this._actionPackStageComplete,
        completed: CdoTaskList.dateStageComplete(this.cdoSummary.applicationFeePaid)
      },
      timestamp
    )
  }

  get form2Sent () {
    const completed = CdoTaskList.dateStageComplete(this.cdoSummary.form2Sent)
    return new CdoTask(
      'form2Sent',
      {
        available: this._actionPackStageComplete,
        completed,
        readonly: completed
      },
      this.cdoSummary.form2Sent
    )
  }

  get neuteringRulesPassed () {
    if (this.exemption.exemptionOrder !== '2015') {
      return false
    }

    if (!CdoTaskList.dateStageComplete(this._cdo.exemption.verificationDatesRecorded)) {
      return false
    }

    if (this._cdo.dog.breed !== 'XL Bully') {
      return false
    }

    // Date of Birth must be less than 16 months ago
    if (!this._cdo.dog.youngerThanSixteenMonthsAtDate(this._cdo.exemption.cdoIssued)) {
      return false
    }

    if (!CdoTaskList.dateStageComplete(this._cdo.exemption.neuteringDeadline)) {
      return false
    }

    // Neutering deadline > today
    return Date.now() < this._cdo.exemption.neuteringDeadline
  }

  get microchipRulesPassed () {
    if (this.exemption.exemptionOrder !== '2015') {
      return false
    }

    if (!CdoTaskList.dateStageComplete(this._cdo.exemption.verificationDatesRecorded)) {
      return false
    }

    if (!CdoTaskList.dateStageComplete(this._cdo.exemption.microchipDeadline)) {
      return false
    }

    // Microchip deadline > yesterday
    return Date.now() < this._cdo.exemption.microchipDeadline.getTime()
  }

  get verificationDateRecorded () {
    let timestamp
    let completed

    let neuteringRulesPassed = this.neuteringRulesPassed
    let microchipRulesPassed = this.microchipRulesPassed

    if (CdoTaskList.dateStageComplete(this.cdoSummary.microchipVerification)) {
      microchipRulesPassed = true
    }

    if (CdoTaskList.dateStageComplete(this.cdoSummary.neuteringConfirmation)) {
      neuteringRulesPassed = true
    }

    if (neuteringRulesPassed && microchipRulesPassed) {
      completed = true
      timestamp = this._cdo.exemption.verificationDatesRecorded
    }

    return new CdoTask(
      'verificationDateRecorded',
      {
        available: this.form2Sent.completed,
        completed
      },
      timestamp
    )
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
      throw new ActionAlreadyPerformedError('Form Two can only be sent once')
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
