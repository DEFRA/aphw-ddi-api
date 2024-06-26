const CdoTask = require('./cdoTask')

class CdoTaskList {
  constructor (cdo) {
    this._cdo = cdo
  }

  get _stageOneComplete () {
    return this.applicationPackSent.completed
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
    return new CdoTask(
      'insuranceDetailsRecorded',
      {
        available: this._stageOneComplete
      }
    )
  }

  get microchipNumberRecorded () {
    return new CdoTask(
      'microchipNumberRecorded',
      {
        available: this._stageOneComplete
      }
    )
  }

  get applicationFeePaid () {
    return new CdoTask(
      'applicationFeePaid',
      {
        available: this._stageOneComplete
      }
    )
  }

  get form2Sent () {
    return new CdoTask(
      'form2Sent',
      {
        available: this._stageOneComplete
      }
    )
  }

  get verificationDateRecorded () {
    return new CdoTask('verificationDateRecorded')
  }

  get certificateIssued () {
    return new CdoTask('certificateIssued')
  }
}

module.exports = CdoTaskList
