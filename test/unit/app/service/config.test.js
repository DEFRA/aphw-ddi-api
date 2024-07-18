const ServiceProvider = require('../../../../app/service/config')
const dogRepository = require('../../../../app/repos/dogs')
const breachRepository = require('../../../../app/repos/breaches')
const { devUser } = require('../../../mocks/auth')
const { buildCdoDog, NOT_COVERED_BY_INSURANCE, NOT_ON_LEAD_OR_MUZZLED, INSECURE_PLACE } = require('../../../mocks/cdo/domain')
const { Dog } = require('../../../../app/data/domain')

describe('ServiceProvider', () => {
  jest.mock('../../../../app/repos/cdo')
  const cdoRepository = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/repos/dogs')
  const dogRepository = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/breaches')
  const breachRepository = require('../../../../app/repos/breaches')

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

  describe('getDogService', () => {
    dogRepository.getDogModel.mockResolvedValue(new Dog(buildCdoDog()))
    breachRepository.getBreachCategories.mockResolvedValue([
      NOT_COVERED_BY_INSURANCE,
      NOT_ON_LEAD_OR_MUZZLED,
      INSECURE_PLACE
    ])

    test('should initialise cdoService.getDogService', async () => {
      const dogService = ServiceProvider.getDogService()
      await dogService.setBreaches(
        'ED300001',
        [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ],
        devUser
      )
      expect(dogRepository.getDogModel).toHaveBeenCalledTimes(2)
      expect(dogRepository.saveDog).toHaveBeenCalledTimes(1)
      expect(breachRepository.getBreachCategories).toHaveBeenCalledTimes(1)
    })

    test('should use pre-initialised cdoService second time getCdoService is called', async () => {
      const dogService = ServiceProvider.getDogService()
      await dogService.setBreaches(
        'ED300002',
        [
          'NOT_COVERED_BY_INSURANCE',
          'NOT_ON_LEAD_OR_MUZZLED',
          'INSECURE_PLACE'
        ],
        devUser
      )
      expect(dogRepository.getDogModel).toHaveBeenCalledTimes(4)
      expect(dogRepository.saveDog).toHaveBeenCalledTimes(2)
      expect(breachRepository.getBreachCategories).toHaveBeenCalledTimes(2)
    })
  })
})
