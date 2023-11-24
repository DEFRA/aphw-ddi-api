const { dbLogErrorToBacklog, dbLogWarningToBacklog, dbFindAll, dbFindOne, dbUpdate, dbCreate, dbDelete } = require('../../../../app/lib/db-functions')

describe('DbFunctions test', () => {
  test('dbLogErrorToBacklog should handle error string', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    mockRow.status = 'OK'
    await dbLogErrorToBacklog(mockRow, 'test string')
    expect(mockRow.update).toHaveBeenCalledWith({ status: 'PROCESSING_ERROR', errors: 'test string' })
  })

  test('dbLogErrorToBacklog should handle error string with previous status', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    mockRow.status = 'PROCESSED_PERSON'
    await dbLogErrorToBacklog(mockRow, 'test string')
    expect(mockRow.update).toHaveBeenCalledWith({ status: 'PROCESSED_PERSON then PROCESSING_ERROR', errors: 'test string' })
  })

  test('dbLogErrorToBacklog should handle error array', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    mockRow.status = 'OK'
    await dbLogErrorToBacklog(mockRow, ['test string1', 'test string2'])
    expect(mockRow.update).toHaveBeenCalledWith({ status: 'PROCESSING_ERROR', errors: 'test string1, test string2' })
  })

  test('dbLogErrorToBacklog should handle error array with embedded message', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    mockRow.status = 'OK'
    await dbLogErrorToBacklog(mockRow, [{ message: 'test string1' }, { message: 'test string2' }])
    expect(mockRow.update).toHaveBeenCalledWith({ status: 'PROCESSING_ERROR', errors: 'test string1, test string2' })
  })

  test('dbLogEWarningToBacklog should call update', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    await dbLogWarningToBacklog(mockRow, 'warning text')
    expect(mockRow.update).toHaveBeenCalledWith({ warnings: 'warning text' })
  })

  test('dbLogEWarningToBacklog should concatenate if existing warning', async () => {
    const mockRow = jest.fn()
    mockRow.update = jest.fn()
    mockRow.warnings = 'previous warning'
    await dbLogWarningToBacklog(mockRow, 'new warning')
    expect(mockRow.update).toHaveBeenCalledWith({ warnings: 'previous warning new warning' })
  })

  test('dbFindAll should call findAll', async () => {
    const mockModel = jest.fn()
    mockModel.findAll = jest.fn()
    await dbFindAll(mockModel, { param1: 'val1' })
    expect(mockModel.findAll).toHaveBeenCalledWith({ param1: 'val1' })
  })

  test('dbFindOne should call findOne', async () => {
    const mockModel = jest.fn()
    mockModel.findOne = jest.fn()
    await dbFindOne(mockModel, { param1: 'val1' })
    expect(mockModel.findOne).toHaveBeenCalledWith({ param1: 'val1' })
  })

  test('dbUpdate should call update', async () => {
    const mockModel = jest.fn()
    mockModel.update = jest.fn()
    await dbUpdate(mockModel, { param1: 'val1' })
    expect(mockModel.update).toHaveBeenCalledWith({ param1: 'val1' })
  })

  test('dbCreate should call create', async () => {
    const mockModel = jest.fn()
    mockModel.create = jest.fn()
    await dbCreate(mockModel, { entityName: 'entity' }, { param1: 'val1' })
    expect(mockModel.create).toHaveBeenCalledWith({ entityName: 'entity' }, { param1: 'val1' })
  })

  test('dbDelete should call destroy', async () => {
    const mockModel = jest.fn()
    mockModel.destroy = jest.fn()
    await dbDelete(mockModel, { param1: 'val1' })
    expect(mockModel.destroy).toHaveBeenCalledWith({ param1: 'val1' })
  })
})
