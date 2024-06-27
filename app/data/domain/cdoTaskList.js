const CdoTask = require('./cdoTask')

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

  static dateIsInTheFuture (date) {
    return date.getTime() > Date.now()
  }

  get _stageOneComplete () {
    return this.applicationPackSent.completed
  }

  get _stageTwoComplete () {
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
    const completed = this.cdoSummary.insuranceCompany !== undefined && CdoTaskList.dateStageComplete(this.cdoSummary.insuranceRenewalDate) && CdoTaskList.dateIsInTheFuture(this.cdoSummary.insuranceRenewalDate)
    let timestamp

    if (completed) {
      timestamp = insurance?.insuranceRenewal
    }

    return new CdoTask(
      'insuranceDetailsRecorded',
      {
        available: this._stageOneComplete,
        completed
      },
      timestamp
    )
  }

  get microchipNumberRecorded () {
    return new CdoTask(
      'microchipNumberRecorded',
      {
        available: this._stageOneComplete,
        completed: this.cdoSummary.microchipNumber !== undefined
      }
    )
  }

  get applicationFeePaid () {
    return new CdoTask(
      'applicationFeePaid',
      {
        available: this._stageOneComplete,
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
        available: this._stageOneComplete,
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
        available: this._stageTwoComplete && !completed,
        completed
      },
      this.cdoSummary.certificateIssued
    )
  }
}

module.exports = CdoTaskList
