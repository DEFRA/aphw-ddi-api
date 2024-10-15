describe('Search repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    models: {
      search_index: {
        create: jest.fn(),
        save: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
      }
    },
    col: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    fn: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/search-tgrams')
  const { updateTrigramsPerDogOrPerson } = require('../../../../app/repos/search-tgrams')

  const { updateSearchIndexDog } = require('../../../../app/repos/search-index')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('UpdateSearchIndexDog', () => {
    test('should handle sub-status', async () => {
      const mockSave = jest.fn()
      sequelize.models.search_index.findAll.mockResolvedValue([
        { dog_id: 1, person_id: 1, search: '12345', json: '{ dogName: \'Bruno\' }', save: mockSave }
      ])

      const dog = {
        id: 1,
        index_number: 123,
        name: 'Bruno2',
        status: { status: 'Inactive' },
        dog_microchips: [
          { id: 1, microchip: { id: 1, microchip_number: '123456789012345' } },
          { id: 2, microchip: { id: 2, microchip_number: '234567890123456' } }
        ],
        stolen_date: '2024-05-15'
      }

      await updateSearchIndexDog(dog, {})

      expect(mockSave).toHaveBeenCalledTimes(1)
      const expectDogCall = {
        dog_id: 1,
        json: {
          address: {
            address_line_1: undefined,
            address_line_2: undefined,
            postcode: undefined,
            town: undefined
          },
          dogIndex: 123,
          dogName: 'Bruno2',
          dogStatus: 'Inactive',
          dogSubStatus: 'stolen',
          email: undefined,
          firstName: undefined,
          lastName: undefined,
          microchipNumber: '123456789012345',
          microchipNumber2: '234567890123456',
          organisationName: undefined,
          personReference: undefined
        },
        person_id: 1,
        save: expect.anything(),
        search: undefined
      }
      expect(updateTrigramsPerDogOrPerson).toHaveBeenCalledWith(1, 'dog', expectDogCall, {})
    })
  })
})
