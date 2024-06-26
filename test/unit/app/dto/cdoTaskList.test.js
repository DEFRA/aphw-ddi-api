const { buildCdo } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')
const { mapCdoTaskListToDto } = require('../../../../app/dto/cdoTaskList')
const { buildCdoTaskListDto, buildCdoTaskListDtoTasks } = require('../../../mocks/cdo/dto')

describe('mapCdoTaskListToDto', () => {
  test('should map cdoTaskListToDto', () => {
    const cdo = buildCdo()
    const cdoTaskList = new CdoTaskList(cdo)
    const cdoTaskListDto = mapCdoTaskListToDto(cdoTaskList)
    const expectedDto = buildCdoTaskListDto({
      tasks: buildCdoTaskListDtoTasks({
        applicationPackSent: {
          key: 'applicationPackSent',
          available: true,
          completed: false,
          readonly: false,
          timestamp: undefined
        }
      })
    })

    expect(cdoTaskListDto).toEqual(expectedDto)
  })
})
