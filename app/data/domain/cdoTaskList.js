const CdoTask = require('./cdoTask')

class CdoTaskList {
  constructor (cdo) {
    this._cdo = cdo
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
    return new CdoTask('insuranceDetailsRecorded')
  }

  get microchipNumberRecorded () {
    return new CdoTask('microchipNumberRecorded')
  }

  get applicationFeePaid () {
    return new CdoTask('applicationFeePaid')
  }

  get form2Sent () {
    return new CdoTask('form2Sent')
  }

  get verificationDateRecorded () {
    return new CdoTask('verificationDateRecorded')
  }

  get certificateIssued () {
    return new CdoTask('certificateIssued')
  }
}

module.exports = CdoTaskList
