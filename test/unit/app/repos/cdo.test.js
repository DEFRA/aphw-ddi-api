const { payload: mockCdoPayload, payloadWithPersonReference: mockCdoPayloadWithRef } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { personDao: mockPersonPayload, createdPersonDao: mockCreatedPersonPayload } = require('../../../mocks/person')
const { devUser } = require('../../../mocks/auth')
const { Op } = require('sequelize')

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
  const { Op } = require('sequelize')

  jest.mock('../../../../app/repos/people')
  const { createPeople, getPersonByReference, updatePerson, updatePersonFields } = require('../../../../app/repos/people')

  jest.mock('../../../../app/repos/dogs')
  const { createDogs, getDogByIndexNumber } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/search')
  const { addToSearchIndex } = require('../../../../app/repos/search')

  jest.mock('../../../../app/messaging/send-event')
  const { sendEvent } = require('../../../../app/messaging/send-event')

  const { createCdo, getCdo, getAllCdos, getSummaryCdos } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendEvent.mockResolvedValue()
  })

  describe('createCdo', () => {
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
      expect(updatePerson).not.toHaveBeenCalled()
      expect(updatePersonFields).not.toHaveBeenCalled()
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
      expect(updatePersonFields).not.toHaveBeenCalled()
    })

    test('createCdo should use existing owner record but updated DOB given valid owner personReference and original has blank DOB', async () => {
      const owner = { id: 1, ...mockPersonPayload, birth_date: null }
      const reloadMock = jest.fn(() => {
        owner.birth_date = '1951-09-25'
      })
      owner.reload = reloadMock
      const expectedOwner = { id: 1, ...mockCreatedPersonPayload }
      const dogs = [{ id: 1, ...mockCdoPayloadWithRef.dogs[0] }]

      getPersonByReference.mockResolvedValue(owner)
      updatePersonFields.mockResolvedValue()
      createDogs.mockResolvedValue(dogs)
      addToSearchIndex.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      const cdo = await createCdo({
        ...mockCdoPayloadWithRef,
        owner: {
          ...mockCdoPayloadWithRef.owner,
          dateOfBirth: '1951-09-25'
        }
      }, devUser, {})

      expect(cdo.owner).toEqual(expectedOwner)
      expect(cdo.dogs).toEqual(dogs)
      expect(createPeople).not.toHaveBeenCalled()
      expect(updatePersonFields).toBeCalledWith(1, {
        dateOfBirth: '1951-09-25'
      }, expect.anything(), expect.anything())
      expect(reloadMock).toBeCalledWith({ transaction: expect.anything() })
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
  })

  describe('getCdo', () => {
    test('getCdo should return CDO', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([{ id: 123, breed: 'breed', name: 'Bruno' }])

      const res = await getCdo('ED123')
      expect(sequelize.models.dog.findAll).toHaveBeenCalledTimes(1)
      expect(res).not.toBe(null)
      expect(res.id).toBe(123)
    })
  })

  describe('getAllCdos', () => {
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

  describe('getSummaryCdos', () => {
    const preExempt1 = {
      id: 300013,
      index_number: 'ED300013',
      status_id: 5,
      registered_person: [
        {
          id: 13,
          person: {
            id: 10,
            first_name: 'Scott',
            last_name: 'Pilgrim',
            person_reference: 'P-1234-5678'
          }
        }
      ],
      status: {
        id: 5,
        status: 'Pre-exempt',
        status_type: 'STANDARD'
      },
      registration: {
        id: 13,
        cdo_expiry: '2024-03-01',
        joined_exemption_scheme: '2023-11-12',
        police_force: {
          id: 5,
          name: 'Cheshire Constabulary'
        }
      }
    }
    const preExempt2 = {
      id: 300014,
      index_number: 'ED300014',
      status_id: 5,
      registered_person: [
        {
          id: 14,
          person: {
            id: 11,
            first_name: 'Scott',
            last_name: 'Pilgrim',
            person_reference: 'P-2345-6789'
          }
        }
      ],
      status: {
        id: 5,
        status: 'Pre-exempt',
        status_type: 'STANDARD'
      },
      registration: {
        id: 14,
        cdo_expiry: '2024-03-01',
        joined_exemption_scheme: '2023-11-12',
        police_force: {
          id: 5,
          name: 'Cheshire Constabulary'
        }
      }
    }

    test('should be a get all cdos by exemption status', async () => {
      const dbResponse = [
        preExempt1,
        preExempt2
      ]
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.cdo_expiry')

      const res = await getSummaryCdos({ status: ['PreExempt'] })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: [[expect.anything(), 'ASC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should sort', async () => {
      const dbResponse = []
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.joined_exemption_scheme')

      const res = await getSummaryCdos({ status: ['PreExempt'] }, { key: 'joinedExemptionScheme', order: 'DESC' })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: [[expect.anything(), 'DESC'], [expect.anything(), 'DESC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.joined_exemption_scheme')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should be a get all cdos by multiple exemption statuses', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])

      const res = await getSummaryCdos({ status: ['PreExempt', 'InterimExempt'] })
      expect(res).toEqual([])
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: expect.any(Array),
        where: {
          '$status.status$': ['Pre-exempt', 'Interim exempt']
        }
      })
    })

    test('should be a get all cdos within 30 days', async () => {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000

      const now = Date.now()
      const dayInThirtyDays = new Date(now + thirtyDays)

      sequelize.models.dog.findAll.mockResolvedValue([])

      const res = await getSummaryCdos({ withinDays: 30 })
      expect(res).toEqual([])
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: expect.any(Array),
        where: {
          '$registration.cdo_expiry$': {
            [Op.lte]: dayInThirtyDays
          }
        }
      })
    })

    test('should get FAILED cdos within Non-compliance Letter not sent', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])

      await getSummaryCdos({ status: ['PreExempt'], nonComplianceLetterSent: false })
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: [[expect.anything(), 'ASC']],
        where: {
          '$status.status$': ['Pre-exempt'],
          '$registration.non_compliance_letter_sent$': {
            [Op.is]: null
          }
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should get FAILED cdos within Non-compliance Letter sent', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])

      const res = await getSummaryCdos({ status: ['Failed'], nonComplianceLetterSent: true })
      expect(res).toEqual([])
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'index_number', 'status_id'],
        include: expect.any(Array),
        order: expect.any(Array),
        where: {
          '$status.status$': ['Failed'],
          '$registration.non_compliance_letter_sent$': {
            [Op.not]: null
          }
        }
      })
    })
  })
})
