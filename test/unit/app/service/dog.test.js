const { devUser } = require('../../../mocks/auth')
const { Dog, BreachCategory, Exemption, Person } = require('../../../../app/data/domain')
const { buildCdoDog, buildExemption, buildCdoPerson } = require('../../../mocks/cdo/domain')
const { allBreachDAOs, buildDogDao } = require('../../../mocks/cdo/get')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { DogActionNotAllowedException } = require('../../../../app/errors/domain/dogActionNotAllowedException')
const { EXEMPTION } = require('../../../../app/constants/event/audit-event-object-types')

describe('DogService', function () {
  let mockDogRepository
  let mockBreachesRepository
  let dogService

  const { DogService } = require('../../../../app/service/dog')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/repos/people')
  const { updatePersonEmail } = require('../../../../app/repos/people')

  jest.mock('../../../../app/lib/email-helper')
  const { emailWithdrawalConfirmation } = require('../../../../app/lib/email-helper')

  beforeEach(function () {
    jest.clearAllMocks()

    // Create a mock Dog Repository
    mockDogRepository = {
      getDogByIndexNumber: jest.fn(),
      getDogModel: jest.fn(),
      saveDogFields: jest.fn(),
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
      expect(mockDogRepository.saveDog).toHaveBeenCalledWith(dog, undefined, undefined)
      expect(dog.getChanges()).toEqual([
        {
          key: 'dogBreaches',
          value: expectedBreaches,
          callback: undefined
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

    test('should set breaches given they have already been set', async () => {
      const dog = new Dog(buildCdoDog({
        status: 'In breach',
        dogBreaches: [
          new BreachCategory({
            id: 9,
            label: 'death of dog not reported to Defra',
            short_name: 'DOG_DEATH_NOT_REPORTED'
          }),
          new BreachCategory({
            id: 10,
            label: 'dog’s export not reported to Defra',
            short_name: 'DOG_EXPORT_NOT_REPORTED'
          })
        ]
      }))
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
        })
      ]
      const expectedDog = new Dog(buildCdoDog({
        dogBreaches: expectedBreaches
      }))

      mockBreachesRepository.getBreachCategories.mockResolvedValue(allBreachDAOs)
      mockDogRepository.getDogModel.mockResolvedValueOnce(dog)
      mockDogRepository.getDogModel.mockResolvedValueOnce(expectedDog)

      await dogService.setBreaches(
        'ED300097',
        ['NOT_ON_LEAD_OR_MUZZLED', 'INSECURE_PLACE'],
        devUser
      )
      await dog.getChanges()[1].callback()

      expect(dog.getChanges()).toEqual([
        {
          key: 'dogBreaches',
          value: expectedBreaches,
          callback: undefined
        },
        {
          key: 'status',
          value: 'In breach',
          callback: expect.any(Function)
        }
      ])
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: '',
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

  describe('setBreach', () => {
    test('should set a breach', async () => {
      const dogDao = buildDogDao()

      const expectedBreaches = [
        new BreachCategory({
          id: 1,
          label: 'dog not covered by third party insurance',
          short_name: 'NOT_COVERED_BY_INSURANCE'
        })
      ]

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

      const changedDog = await dogService.setBreach(
        dogDao,
        'NOT_COVERED_BY_INSURANCE',
        devUser,
        {}
      )
      await changedDog.getChanges()[1].callback()

      expect(mockDogRepository.saveDogFields).toHaveBeenCalledWith(changedDog, dogDao, {})

      expect(changedDog.getChanges()).toEqual([
        {
          key: 'dogBreaches',
          value: expectedBreaches,
          callback: undefined
        },
        {
          key: 'status',
          value: 'In breach',
          callback: expect.any(Function)
        }
      ])

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
            'dog not covered by third party insurance'
          ]
        },
        devUser)
    })
  })

  describe('withdrawDog', () => {
    test('should withdraw dog by post', async () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const person = new Person(buildCdoPerson())
      const dog = new Dog(buildCdoDog({
        indexNumber: 'ED300001',
        exemption,
        person,
        dateOfBirth: new Date('2023-07-22'),
        status: 'Interim Exempt'
      }))
      mockDogRepository.getDogModel.mockResolvedValue(dog)
      const dogService = new DogService(mockDogRepository, mockBreachesRepository)
      await dogService.withdrawDog({
        indexNumber: 'ED300001',
        user: devUser,
        withdrawOption: 'post'
      })

      expect(mockDogRepository.saveDog).toHaveBeenCalledWith(dog, undefined)
    })

    test('should withdraw dog by email', async () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const person = new Person(buildCdoPerson())
      const dog = new Dog(buildCdoDog({
        indexNumber: 'ED300001',
        exemption,
        person,
        dateOfBirth: new Date('2023-07-22'),
        status: 'Interim Exempt'
      }))
      const expectedPreAudit = { index_number: 'ED300001', status: 'Interim Exempt', withdrawn: null }
      const expectedPostAudit = { index_number: 'ED300001', status: 'Withdrawn', withdrawn: expect.any(Date) }
      mockDogRepository.getDogModel.mockResolvedValue(dog)
      const dogService = new DogService(mockDogRepository, mockBreachesRepository)
      await dogService.withdrawDog({
        indexNumber: 'ED300001',
        user: devUser,
        withdrawOption: 'email'
      })
      await dog.getChanges()[0].callback()
      await mockDogRepository.saveDog.mock.calls[0][1]()

      expect(mockDogRepository.saveDog).toHaveBeenCalledWith(dog, expect.any(Function))
      expect(sendUpdateToAudit).toHaveBeenCalledWith(EXEMPTION, expectedPreAudit, expectedPostAudit, devUser)
      expect(emailWithdrawalConfirmation).toHaveBeenCalledWith(exemption, person, dog)
    })

    test('should withdraw dog and update email', async () => {
      const exemption = new Exemption(buildExemption({
        exemptionOrder: '2023'
      }))
      const person = new Person(buildCdoPerson({
        personReference: 'P-8AD0-561A'
      }))
      const dog = new Dog(buildCdoDog({
        indexNumber: 'ED300001',
        exemption,
        person,
        dateOfBirth: new Date('2023-07-22'),
        status: 'Interim Exempt'
      }))
      mockDogRepository.getDogModel.mockResolvedValue(dog)
      const dogService = new DogService(mockDogRepository, mockBreachesRepository)
      await dogService.withdrawDog({
        indexNumber: 'ED300001',
        user: devUser,
        email: 'garrymcfadyen@hotmail.com',
        withdrawOption: 'email'
      })
      expect(updatePersonEmail).toHaveBeenCalledWith('P-8AD0-561A', 'garrymcfadyen@hotmail.com', devUser)
      expect(person.contactDetails.email).toBe('garrymcfadyen@hotmail.com')
    })
    test('should error is dog not found', async () => {
      mockDogRepository.getDogModel.mockResolvedValue(undefined)
      const dogService = new DogService(mockDogRepository, mockBreachesRepository)
      await expect(dogService.withdrawDog({ indexNumber: 'ED300000', user: devUser, withdrawOption: 'email' })).rejects.toThrow(new NotFoundError('Dog ED300000 not found'))
    })

    test('should error if dog not valid', async () => {
      const exemption = new Exemption(buildExemption({ exemptionOrder: '2023' }))
      const dog = new Dog(buildCdoDog({
        exemption,
        dateOfBirth: new Date()
      }))
      mockDogRepository.getDogModel.mockResolvedValue(dog)
      const dogService = new DogService(mockDogRepository, mockBreachesRepository)

      await expect(dogService.withdrawDog({ indexNumber: 'ED300097', user: devUser, withdrawOption: 'email' })).rejects.toThrow(new DogActionNotAllowedException('Dog ED300097 is not valid for withdrawal'))
    })
  })
})
