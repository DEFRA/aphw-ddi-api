const ServiceProvider = require('../../../../app/service/config')

describe('ServiceProvider', () => {
  jest.mock('../../../../app/repos/cdo')
  const cdoRepository = require('../../../../app/repos/cdo')

  test('should instantiate', () => {
    expect(ServiceProvider.getCdoService).toBeInstanceOf(Function)
  })

  describe('getCdoService', () => {
    test('should initialise cdoService.getCdoService', async () => {
      const cdoService = ServiceProvider.getCdoService()
      await cdoService.getTaskList('ED300001')
      expect(cdoRepository.getCdoTaskList).toHaveBeenCalledTimes(1)
    })

    test('should use pre-initialised cdoService second time getCdoService is called', async () => {
      const cdoService = ServiceProvider.getCdoService()
      await cdoService.getTaskList('ED300002')
      expect(cdoRepository.getCdoTaskList).toHaveBeenCalledTimes(2)
    })
  })
})
