class CdoTaskList {
  constructor (cdo) {
    this._cdo = cdo
  }

  get applicationPackSent () {
    const timestamp = this._cdo.exemption.applicationPackSent ?? undefined
    const completed = timestamp !== undefined

    return {
      key: 'applicationPackSent',
      available: true,
      completed,
      readonly: completed,
      timestamp
    }
  }
}

module.exports = CdoTaskList
