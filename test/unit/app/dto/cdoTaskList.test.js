const { buildCdo } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')
const { mapCdoTaskListToDto } = require('../../../../app/dto/cdoTaskList')
describe('mapCdoTaskListToDto', () => {
  test('should map cdoTaskListToDto', () => {
    const cdo = buildCdo()
    const cdoTaskList = new CdoTaskList(cdo)
    const cdoTaskListDto = mapCdoTaskListToDto(cdoTaskList)
    const expectedDto = {
      tasks: {
        applicationPackSent: {
          key: 'applicationPackSent',
          available: true,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        insuranceDetailsRecorded: {
          key: 'insuranceDetailsRecorded',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        microchipNumberRecorded: {
          key: 'microchipNumberRecorded',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        applicationFeePaid: {
          key: 'applicationFeePaid',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        form2Sent: {
          key: 'form2Sent',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        verificationDateRecorded: {
          key: 'verificationDateRecorded',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        },
        certificateIssued: {
          key: 'certificateIssued',
          available: false,
          completed: false,
          readonly: false,
          timestamp: undefined
        }
      }
    }

    expect(cdoTaskListDto).toEqual(expectedDto)
  })
})
