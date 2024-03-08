const { payload: mockCdoPayload, payloadWithPersonReference: mockCdoPayloadWithRef } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/notFound')
const { personDao: mockPersonPayload, createdPersonDao: mockCreatedPersonPayload } = require('../../../mocks/person')

const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

describe('CDO repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn(),
    col: jest.fn(),
    models: {
      dog: {
        findOne: jest.fn(),
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/people')
  const { createPeople, getPersonByReference } = require('../../../../app/repos/people')

  jest.mock('../../../../app/repos/dogs')
  const { createDogs, getDogByIndexNumber } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/search')
  const { addToSearchIndex } = require('../../../../app/repos/search')

  jest.mock('../../../../app/messaging/send-event')
  const { sendEvent } = require('../../../../app/messaging/send-event')

  const { createCdo, getCdo, getAllCdos } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendEvent.mockResolvedValue()
  })

  test('createCdo should create start new transaction if none passed', async () => {
    await createCdo(mockCdoPayload, devUser)

    expect(sequelize.transaction).toHaveBeenCalledTimes(1)
  })

  test('createCdo should create start new transaction if passed', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    await createCdo(mockCdoPayload, devUser, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('createCdo should return owner and created dogs', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    const cdo = await createCdo(mockCdoPayload, devUser, {})

    expect(cdo.owner).toEqual(owners[0])
    expect(cdo.dogs).toEqual(dogs)
  })

  test('createCdo should use existing owner record if valid owner personReference is supplied', async () => {
    const owner = { id: 1, ...mockPersonPayload }
    const expectedOwner = { id: 1, ...mockCreatedPersonPayload }
    const dogs = [{ id: 1, ...mockCdoPayloadWithRef.dogs[0] }]

    getPersonByReference.mockResolvedValue(owner)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    const cdo = await createCdo(mockCdoPayloadWithRef, devUser, {})

    expect(cdo.owner).toEqual(expectedOwner)
    expect(cdo.dogs).toEqual(dogs)
    expect(createPeople).not.toHaveBeenCalled()
    expect(getPersonByReference).toHaveBeenCalledWith('P-6076-A37C', expect.anything())
  })

  test('createCdo throw a NotFoundError if invalid owner personReference is supplied', async () => {
    const owners = [{ id: 1, ...mockCdoPayloadWithRef.owner }]
    const dogs = [{ id: 1, ...mockCdoPayloadWithRef.dogs[0] }]

    getPersonByReference.mockResolvedValue(null)
    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    await expect(createCdo(mockCdoPayloadWithRef, devUser, {})).rejects.toThrow(NotFoundError)

    expect(createPeople).not.toHaveBeenCalled()
    expect(createDogs).not.toHaveBeenCalled()
    expect(addToSearchIndex).not.toHaveBeenCalled()
    expect(sendEvent).not.toHaveBeenCalled()
  })

  test('createCdo should handle multiple dogs sending multiple audit events', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }, { id: 2, ...mockCdoPayload.dogs[1] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()

    const cdo = await createCdo(mockCdoPayload, devUser, {})

    expect(cdo.owner).toEqual(owners[0])
    expect(cdo.dogs).toEqual(dogs)
    expect(sendEvent).toHaveBeenCalledTimes(2)
    const callPayload1 = JSON.parse(sendEvent.mock.calls[0][0].data.message)
    expect(callPayload1.created.owner.lastName).toBe('Bloggs')
    expect(callPayload1.created.dog.name).toBe('Buster')
    const callPayload2 = JSON.parse(sendEvent.mock.calls[1][0].data.message)
    expect(callPayload2.created.owner.lastName).toBe('Bloggs')
    expect(callPayload2.created.dog.name).toBe('Alice')
  })

  test('createCdo should throw if error', async () => {
    createPeople.mockRejectedValue(new Error('Test error'))

    await expect(createCdo(mockCdoPayload, devUser, {})).rejects.toThrow('Test error')
  })

  test('createCdo should throw error if no username for auditing', async () => {
    const owners = [{ id: 1, ...mockCdoPayload.owner }]
    const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

    createPeople.mockResolvedValue(owners)
    createDogs.mockResolvedValue(dogs)
    addToSearchIndex.mockResolvedValue()
    getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

    await expect(createCdo(mockCdoPayload, {}, {})).rejects.toThrow('Username and displayname are required for auditing')
  })

  test('getCdo should return CDO', async () => {
    sequelize.models.dog.findAll.mockResolvedValue([{ id: 123, breed: 'breed', name: 'Bruno' }])

    const res = await getCdo('ED123')
    expect(sequelize.models.dog.findAll).toHaveBeenCalledTimes(1)
    expect(res).not.toBe(null)
    expect(res.id).toBe(123)
  })

  test('getAllCdos should return CDOs', async () => {
    sequelize.models.dog.findAll.mockResolvedValue([
      { id: 123, breed: 'breed', name: 'Bruno' },
      { id: 456, breed: 'breed2', name: 'Fido' }
    ])

    const res = await getAllCdos()
    expect(sequelize.models.dog.findAll).toHaveBeenCalledTimes(1)
    expect(res).not.toBe(null)
    expect(res.length).toBe(2)
    expect(res[1].id).toBe(456)
  })
})
