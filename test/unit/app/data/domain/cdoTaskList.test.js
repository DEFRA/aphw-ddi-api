const { CdoTaskList, Cdo, Exemption } = require('../../../../../app/data/domain')
const { buildCdo, buildExemption } = require('../../../../mocks/cdo/domain')
describe('CdoTaskList', () => {
  test('should instantiate ', () => {
    const cdo = buildCdo()
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList._cdo).toBeInstanceOf(Cdo)
  })

  test('should show applicationPackSent in default state', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: null
    })
    const cdo = buildCdo({
      exemption: new Exemption(exemptionProperties)
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.applicationPackSent).toEqual(expect.objectContaining({
      key: 'applicationPackSent',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.microchipNumberRecorded).toEqual(expect.objectContaining({
      key: 'microchipNumberRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.applicationFeePaid).toEqual(expect.objectContaining({
      key: 'applicationFeePaid',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.form2Sent).toEqual(expect.objectContaining({
      key: 'form2Sent',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should show applicationPackSent in non-default state', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25')
    })
    const cdo = buildCdo({
      exemption: new Exemption(exemptionProperties)
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.applicationPackSent).toEqual(expect.objectContaining({
      key: 'applicationPackSent',
      available: true,
      completed: true,
      readonly: true,
      timestamp: new Date('2024-06-25')
    }))
  })
})
