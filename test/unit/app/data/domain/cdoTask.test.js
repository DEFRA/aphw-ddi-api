const { CdoTask } = require('../../../../../app/data/domain')

describe('CdoTask', () => {
  test('should give default', () => {
    const cdoTask = new CdoTask('verificationDateRecorded')
    expect(cdoTask).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })
  test('should instantiate a CdoTask', () => {
    const cdoTask = new CdoTask('applicationPackSent', {
      available: true,
      completed: false,
      readonly: false
    })
    expect(cdoTask).toBeInstanceOf(CdoTask)
    expect(cdoTask).toEqual(expect.objectContaining({
      key: 'applicationPackSent',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })
})
