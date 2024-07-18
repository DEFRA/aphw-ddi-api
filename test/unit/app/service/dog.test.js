const { devUser } = require('../../../mocks/auth')
const { Dog, BreachCategory } = require('../../../../app/data/domain')
const { buildCdoDog } = require('../../../mocks/cdo/domain')

describe('DogService', function () {
  let mockDogRepository
  let mockBreachesRepository
  let dogService

  const { DogService } = require('../../../../app/service/dog')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  beforeEach(function () {
    jest.clearAllMocks()

    // Create a mock Dog Repository
    mockDogRepository = {
      getDogByIndexNumber: jest.fn(),
      getDogModel: jest.fn(),
      saveDog: jest.fn()
    }

    mockBreachesRepository = {
      getBreachCategories: jest.fn()
    }

    // Instantiate CdoService with the mock repository
    dogService = new DogService(mockDogRepository, mockBreachesRepository)
  })

  describe('setBreaches', () => {
    test('should set breaches', async () => {
      const dog = new Dog(buildCdoDog())
      const expectedBreaches = [
        new BreachCategory({
          id: 2,
          label: 'dog not kept on lead or muzzled',
          short_name: 'NOT_ON_LEAD_OR_MUZZLED'
        }),
        new BreachCategory({
          id: 3,
          label: 'dog kept in insecure place',
          short_name: 'INSECURE_PLACE'
        })]
      const expectedDog = new Dog(buildCdoDog({
        dogBreaches: expectedBreaches
      }))

      mockBreachesRepository.getBreachCategories.mockResolvedValue([
        {
          id: 1,
          label: 'dog not covered by third party insurance',
          short_name: 'NOT_COVERED_BY_INSURANCE'
        },
        {
          id: 2,
          label: 'dog not kept on lead or muzzled',
          short_name: 'NOT_ON_LEAD_OR_MUZZLED'
        },
        {
          id: 3,
          label: 'dog kept in insecure place',
          short_name: 'INSECURE_PLACE'
        }
      ])
      mockDogRepository.getDogModel.mockResolvedValueOnce(dog)
      mockDogRepository.getDogModel.mockResolvedValueOnce(expectedDog)

      const result = await dogService.setBreaches(
        'ED300097',
        ['NOT_ON_LEAD_OR_MUZZLED', 'INSECURE_PLACE'],
        devUser
      )
      await dog.getChanges()[1].callback()
      expect(mockDogRepository.getDogModel).toHaveBeenCalledWith('ED300097')
      expect(mockBreachesRepository.getBreachCategories).toHaveBeenCalled()
      expect(mockDogRepository.saveDog).toHaveBeenCalledWith(dog)
      expect(dog.getChanges()).toEqual([
        {
          key: 'dogBreaches',
          value: expectedBreaches,
          callback: expect.any(Function)
        },
        {
          key: 'status',
          value: 'In breach',
          callback: expect.any(Function)
        }
      ])
      expect(result).toEqual(expectedDog)
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: 'Interim exempt',
          dog_breaches: []
        },
        {
          index_number: 'ED300097',
          status: 'In breach',
          dog_breaches: [
            'dog not kept on lead or muzzled',
            'dog kept in insecure place'
          ]
        },
        devUser)
    })
  })
})
