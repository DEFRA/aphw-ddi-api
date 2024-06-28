const { ChangeManager } = require('../../../../../app/data/domain/changeManager')
describe('ChangeManager', () => {
  test('should add changes', () => {
    const changeManager = new ChangeManager()
    const changeMangerChanges = changeManager.update('applicationPackSent', new Date())
    expect(changeManager).toBeInstanceOf(ChangeManager)
    expect(changeMangerChanges).toBeInstanceOf(ChangeManager)
    expect(changeManager).toEqual(changeMangerChanges)
    expect(changeManager.changes).toEqual([{ key: 'applicationPackSent', value: expect.any(Date) }])
    expect(changeManager.updatedFields).toEqual(['applicationPackSent'])
    expect(changeManager.bulkChanges).toEqual({
      applicationPackSent: expect.any(Date)
    })
  })

  test('should instantiate change manager and update', () => {
    const singleChange = ChangeManager.singleChange('microchipNumberRecorded', '123456789012345')
    expect(singleChange).toBeInstanceOf(ChangeManager)
    expect(singleChange.changes).toEqual([{ key: 'microchipNumberRecorded', value: '123456789012345' }])
  })
})
