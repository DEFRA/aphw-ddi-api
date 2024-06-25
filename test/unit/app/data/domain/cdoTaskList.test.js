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
