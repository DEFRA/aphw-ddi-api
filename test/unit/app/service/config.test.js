const ServiceProvider = require('../../../../app/service/config')
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

  jest.mock('../../../../app/repos/user-accounts')
  const userRepository = require('../../../../app/repos/user-accounts')

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

  const request = {
    auth: {
      artifacts: {
        decoded: {
          header: { alg: 'RS256', typ: 'JWT', kid: 'aphw-ddi-enforcement' },
          payload: {
            scope: ['Dog.Index.Enforcement'],
            username: 'dev-user@test.com',
            displayname: 'Dev User',
            token: 'abcdef',
            iat: 1726587632,
            exp: 1726591232,
            aud: 'aphw-ddi-api',
            iss: 'aphw-ddi-enforcement'
          },
          signature: 'abcdef'
        }
      },
      credentials: {
        user: 'dev-user@test.com',
        displayname: 'Dev User'
      }
    },
    headers: {
      'ddi-username': 'dev-user@test.com',
      'ddi-displayname': 'Dev User'
    }
  }

  describe('getRegistrationService', () => {
    test('should initialise getRegistrationService', async () => {
      const regService = ServiceProvider.getRegistrationService()
      await regService.isUserLicenceAccepted(request)
      expect(userRepository.verifyLicenceAccepted).toHaveBeenCalledTimes(1)
    })

    test('should use pre-initialised regService second time getRegistrationService is called', async () => {
      const regService = ServiceProvider.getRegistrationService()
      await regService.isUserLicenceAccepted(request)
      expect(userRepository.verifyLicenceAccepted).toHaveBeenCalledTimes(2)
    })
  })
})
