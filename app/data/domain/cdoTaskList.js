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

  get _actionPackStageComplete () {
    return this.applicationPackSent.completed
  }

  _actionPackCompleteGuard () {
    if (!this._actionPackStageComplete) {
      throw new SequenceViolationError('Application pack must be sent before performing this action')
    }
  }

  get _preCertificateStepsComplete () {
    return this.applicationPackSent.completed &&
    this.insuranceDetailsRecorded.completed &&
    this.microchipNumberRecorded.completed &&
    this.applicationFeePaid.completed &&
    this.form2Sent.completed &&
    this.verificationDateRecorded.completed
  }

  get cdoSummary () {
    const microchipNumber = this._cdo.dog.microchipNumber !== null && `${this._cdo.dog.microchipNumber}`.length > 0 ? this._cdo.dog.microchipNumber : undefined

    return {
      indexNumber: this._cdo.dog.indexNumber,
      applicationPackSent: this._cdo.exemption.applicationPackSent ?? undefined,
      insuranceCompany: this._cdo.exemption.insurance[0]?.company ?? undefined,
      insuranceRenewalDate: this._cdo.exemption.insurance[0]?.insuranceRenewal ?? undefined,
      microchipNumber,
      applicationFeePaid: this._cdo.exemption.applicationFeePaid ?? undefined,
      form2Sent: this._cdo.exemption.formTwoSent ?? undefined,
      neuteringConfirmation: this._cdo.exemption.neuteringConfirmation ?? undefined,
      microchipVerification: this._cdo.exemption.microchipVerification ?? undefined,
      certificateIssued: this._cdo.exemption.certificateIssued ?? undefined
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
    const [insurance] = this._cdo.exemption.insurance
    const completed = this.cdoSummary.insuranceCompany !== undefined && CdoTaskList.dateStageComplete(this.cdoSummary.insuranceRenewalDate) && dateTodayOrInFuture(this.cdoSummary.insuranceRenewalDate)
    let timestamp

    if (completed) {
      timestamp = insurance?.insuranceRenewal
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
    return new CdoTask(
      'microchipNumberRecorded',
      {
        available: this._actionPackStageComplete,
        completed: this.cdoSummary.microchipNumber !== undefined
      }
    )
  }

  get applicationFeePaid () {
    return new CdoTask(
      'applicationFeePaid',
      {
        available: this._actionPackStageComplete,
        completed: CdoTaskList.dateStageComplete(this.cdoSummary.applicationFeePaid)
      },
      this.cdoSummary.applicationFeePaid
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

  get verificationDateRecorded () {
    let timestamp
    let completed

    if (
      CdoTaskList.dateStageComplete(this.cdoSummary.microchipVerification) &&
      CdoTaskList.dateStageComplete(this.cdoSummary.neuteringConfirmation)
    ) {
      completed = true
      timestamp = new Date(Math.max(this.cdoSummary.microchipVerification.getTime(), this.cdoSummary.neuteringConfirmation.getTime()))
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

  sendApplicationPack (callback) {
    if (this.applicationPackSent.completed) {
      throw new ActionAlreadyPerformedError('Application pack can only be sent once')
    }
    this._cdo.exemption.sendApplicationPack(callback)
  }

  addInsuranceDetails (company, renewalDate, callback) {
    this._actionPackCompleteGuard()
    this._cdo.exemption.setInsuranceDetails(company, renewalDate, callback)
  }

  getUpdates () {
    return {
      exemption: this._cdo.exemption.getChanges(),
      dog: [],
      person: []
    }
  }
}

module.exports = CdoTaskList
