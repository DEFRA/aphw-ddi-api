const { payload: mockCdoPayload, payloadWithPersonReference: mockCdoPayloadWithRef } = require('../../../mocks/cdo/create')
const { NotFoundError } = require('../../../../app/errors/not-found')
const { personDao: mockPersonPayload, createdPersonDao: mockCreatedPersonPayload } = require('../../../mocks/person')
const { devUser } = require('../../../mocks/auth')
const {
  buildCdoDao, buildRegistrationDao, buildInsuranceDao, buildInsuranceCompanyDao, buildDogMicrochipDao,
  buildMicrochipDao
} = require('../../../mocks/cdo/get')
const { Cdo, CdoTaskList } = require('../../../../app/data/domain')
const { buildCdo, buildExemption, buildCdoDog } = require('../../../mocks/cdo/domain')

describe('CDO repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    col: jest.fn(),
    models: {
      dog: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        reload: jest.fn()
      }
    },
    fn: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  jest.mock('../../../../app/repos/people')
  const { createPeople, getPersonByReference, updatePerson, updatePersonFields } = require('../../../../app/repos/people')

  jest.mock('../../../../app/repos/dogs')
  const { createDogs, getDogByIndexNumber, updateStatus } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/search')
  const { addToSearchIndex } = require('../../../../app/repos/search')

  jest.mock('../../../../app/repos/insurance')
  const { createOrUpdateInsurance } = require('../../../../app/repos/insurance')

  jest.mock('../../../../app/messaging/send-event')
  const { sendEvent } = require('../../../../app/messaging/send-event')

  jest.mock('../../../../app/repos/microchip')
  const { updateMicrochip } = require('../../../../app/repos/microchip')

  const { createCdo, getCdo, getAllCdos, getSummaryCdos, getCdoModel, getCdoTaskList, saveCdoTaskList } = require('../../../../app/repos/cdo')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendEvent.mockResolvedValue()
  })

  describe('createCdo', () => {
    test('createCdo should create start new transaction if none passed', async () => {
      const owners = [{ id: 1, ...mockCdoPayload.owner }]
      const dogs = [{ id: 1, ...mockCdoPayload.dogs[0] }]

      createPeople.mockResolvedValue(owners)
      createDogs.mockResolvedValue(dogs)
      addToSearchIndex.mockResolvedValue()
      getDogByIndexNumber.mockResolvedValue({ id: 1, index_number: 'ED1' })

      await createCdo(mockCdoPayload, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('createCdo should create use new transaction if passed', async () => {
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

    test('createCdo should handle change of owner', async () => {
      const owner = { id: 1, ...mockPersonPayload, person_reference: 'P-6076-A37C' }
      const expectedOwner = { id: 1, ...mockCreatedPersonPayload, person_reference: 'P-6076-A37C' }
      const changedOwner = {
        oldOwner: {
          firstName: 'John',
          lastName: 'Smith',
          personReference: 'P-6076-A37C'
        },
        newOwner: {
          firstName: 'Peter',
          lastName: 'Snow',
          personReference: 'P-1010-23BA'
        }
      }
      const dogs = [{ id: 1, index_number: 'ED100', ...mockCdoPayloadWithRef.dogs[0], changedOwner }]

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
      expect(sendEvent.mock.calls[0]).toEqual([{
        type: 'uk.gov.defra.ddi.event.create',
        source: 'aphw-ddi-portal',
        partitionKey: 'ED100',
        id: expect.any(String),
        subject: 'DDI Create cdo',
        data: {
          message: '{"actioningUser":{"username":"dev-user@test.com","displayname":"Dev User"},"operation":"created cdo","created":{"owner":{"id":1,"first_name":"Luke","last_name":"Skywalker","birth_date":"1951-09-25","person_reference":"P-6076-A37C","address":{"address_line_1":"Moisture Farm","address_line_2":null,"country":{"id":22,"country":"Tatooine"},"country_id":22,"county":"Mos Eisley State","id":1,"postcode":"ME1 2FF","town":"Eisley Dunes"}},"dog":{"id":1,"index_number":"ED100","breed":"Pit Bull Terrier","name":"Buster","cdoIssued":"2023-10-10","cdoExpiry":"2023-12-10","status":"Status 1","applicationType":"cdo","changedOwner":{"oldOwner":{"firstName":"John","lastName":"Smith","personReference":"P-6076-A37C"},"newOwner":{"firstName":"Peter","lastName":"Snow","personReference":"P-1010-23BA"}}}}}'
        }
      }])
      expect(sendEvent.mock.calls[1]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'ED100',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"dev-user@test.com","displayname":"Dev User"},"operation":"changed dog owner","details":"Owner changed from John Smith"}'
        }
      }])
      expect(sendEvent.mock.calls[2]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-6076-A37C',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"dev-user@test.com","displayname":"Dev User"},"operation":"changed dog owner","details":"Dog ED100 moved to Peter Snow"}'
        }
      }])
      expect(sendEvent.mock.calls[3]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-1010-23BA',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"dev-user@test.com","displayname":"Dev User"},"operation":"changed dog owner","details":"Dog ED100 moved from John Smith"}'
        }
      }])
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
    test('getAllCdos should return all CDOs in one batch if no param passed', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([
        { id: 123, breed: 'breed', name: 'Bruno' },
        { id: 456, breed: 'breed2', name: 'Fido' }
      ])

      const res = await getAllCdos()
      const dbQuery = sequelize.models.dog.findAll.mock.calls[0]
      expect(dbQuery[0].where).toBe(undefined)
      expect(dbQuery[0].limit).toBe(undefined)
      expect(res).not.toBe(null)
      expect(res.length).toBe(2)
      expect(res[1].id).toBe(456)
    })

    test('getAllCdos should return batch of CDOs when params passed', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([
        { id: 123, breed: 'breed', name: 'Bruno' },
        { id: 456, breed: 'breed2', name: 'Fido' }
      ])

      const res = await getAllCdos(100, 250)
      const dbQuery = sequelize.models.dog.findAll.mock.calls[0]
      expect(dbQuery[0].where).toEqual({ '$dog.id$': { [Op.gte]: 100 } })
      expect(dbQuery[0].limit).toBe(250)
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
    const expectedAttributes = ['id', 'index_number', 'status_id', expect.any(Array)]

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
        attributes: expectedAttributes,
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
        attributes: ['id', 'index_number', 'status_id', expect.any(Array)],
        include: expect.any(Array),
        order: [[expect.anything(), 'DESC'], [expect.anything(), 'DESC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.joined_exemption_scheme')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should sort by policeForce ASC', async () => {
      const dbResponse = []
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.joined_exemption_scheme')

      const res = await getSummaryCdos({ status: ['PreExempt'] }, { key: 'policeForce', order: 'ASC' })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        include: expect.any(Array),
        order: [[expect.anything(), 'ASC'], [expect.anything(), 'ASC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.police_force.name')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should sort by policeForce DESC', async () => {
      const dbResponse = []
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.joined_exemption_scheme')

      const res = await getSummaryCdos({ status: ['PreExempt'] }, { key: 'policeForce', order: 'DESC' })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        include: expect.any(Array),
        order: [[expect.anything(), 'DESC'], [expect.anything(), 'DESC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registration.police_force.name')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should sort by owner lastname', async () => {
      const dbResponse = []
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.joined_exemption_scheme')

      const res = await getSummaryCdos({ status: ['PreExempt'] }, { key: 'owner' })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        include: expect.any(Array),
        order: [[expect.anything(), 'ASC'], [expect.anything(), 'ASC'], [expect.anything(), 'ASC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('registered_person.person.last_name')
      expect(sequelize.col).toHaveBeenCalledWith('registered_person.person.first_name')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should sort by dog index number', async () => {
      const dbResponse = []
      sequelize.models.dog.findAll.mockResolvedValue(dbResponse)
      sequelize.col.mockReturnValue('registration.joined_exemption_scheme')

      const res = await getSummaryCdos({ status: ['PreExempt'] }, { key: 'indexNumber' })
      expect(res).toEqual(dbResponse)
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        include: expect.any(Array),
        order: [[expect.anything(), 'ASC'], [expect.anything(), 'ASC']],
        where: {
          '$status.status$': ['Pre-exempt']
        }
      })
      expect(sequelize.col).toHaveBeenCalledWith('id')
      expect(sequelize.col).toHaveBeenCalledWith('registration.cdo_expiry')
    })

    test('should be a get all cdos by multiple exemption statuses', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])

      const res = await getSummaryCdos({ status: ['PreExempt', 'InterimExempt'] })
      expect(res).toEqual([])
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        include: expect.any(Array),
        order: expect.any(Array),
        where: {
          '$status.status$': ['Pre-exempt', 'Interim exempt']
        }
      })
    })

    test('should be a get all cdos within 30 days', async () => {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000

      const now = new Date()
      now.setUTCHours(0, 0, 0, 0)
      const dayInThirtyDays = new Date(now.getTime() + thirtyDays)

      sequelize.models.dog.findAll.mockResolvedValue([])

      const res = await getSummaryCdos({ withinDays: 30 })
      expect(res).toEqual([])
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
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
        attributes: expectedAttributes,
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
        attributes: expectedAttributes,
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

  describe('getCdoModel', () => {
    test('should return getCdo but as a domain model', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([buildCdoDao()])
      const res = await getCdoModel('ED300097')
      expect(res).toBeInstanceOf(Cdo)
    })

    test('should return throw a NotFoundError if index does not exist', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])
      await expect(getCdoModel('ED300097')).rejects.toThrow(NotFoundError)
    })
  })

  describe('getTaskList', () => {
    test('should return getCdoTaskList', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([buildCdoDao()])
      const res = await getCdoTaskList('ED300097')
      expect(res).toEqual(new CdoTaskList(buildCdo()))
    })

    test('should throw a NotFound error given cdo does not exist', async () => {
      sequelize.models.dog.findAll.mockResolvedValue([])
      await expect(getCdoTaskList('ED300097')).rejects.toThrow(NotFoundError)
    })
  })

  describe('saveCdoTaskList', () => {
    test('should create start new transaction if none passed', async () => {
      const dog = buildCdoDao({
        registration: buildRegistrationDao({
          save: jest.fn()
        })
      })

      sequelize.models.dog.findAll.mockResolvedValue([dog])

      const callback = jest.fn()
      const cdoTaskList = new CdoTaskList(buildCdo())
      cdoTaskList.sendApplicationPack(new Date(), callback)

      await saveCdoTaskList(cdoTaskList)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should update applicationPackSent', async () => {
      const dog = buildCdoDao({
        registration: buildRegistrationDao({
          save: jest.fn()
        })
      })

      sequelize.models.dog.findAll.mockResolvedValue([dog])

      const callback = jest.fn()
      const cdoTaskList = new CdoTaskList(buildCdo())
      expect(dog.registration.application_pack_sent).toBeNull()
      cdoTaskList.sendApplicationPack(new Date(), callback)
      const taskList = await saveCdoTaskList(cdoTaskList, {})
      expect(sequelize.models.dog.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { index_number: 'ED300097' }
      }))
      expect(dog.registration.save).toHaveBeenCalled()
      expect(callback).toHaveBeenCalled()
      expect(taskList.applicationPackSent.completed).toBe(true)
    })

    test('should update insurance details', async () => {
      const renewalDate = new Date()

      const dog = buildCdoDao({
        registration: buildRegistrationDao({
          save: jest.fn()
        })
      })
      const editedDog = buildCdoDao({
        registration: buildRegistrationDao({
          save: jest.fn(),
          insurance_details_recorded: new Date()
        }),
        insurance: [buildInsuranceDao({
          company: buildInsuranceCompanyDao({
            company_name: 'Allianz'
          }),
          renewal_date: renewalDate
        })]
      })

      createOrUpdateInsurance.mockResolvedValue({
        company_id: 9,
        renewal_data: renewalDate
      })

      sequelize.models.dog.findAll.mockResolvedValueOnce([dog])
      sequelize.models.dog.findAll.mockResolvedValueOnce([editedDog])

      const callback = jest.fn()

      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        })
      }))
      expect(cdoTaskList.insuranceDetailsRecorded.completed).toBe(false)

      cdoTaskList.recordInsuranceDetails('Allianz', renewalDate, callback)

      const taskList = await saveCdoTaskList(cdoTaskList, {})

      expect(createOrUpdateInsurance).toHaveBeenCalledWith({ insurance: { company: 'Allianz', renewalDate } }, dog, {})
      expect(taskList.insuranceDetailsRecorded.completed).toBe(true)
      expect(callback).toHaveBeenCalled()
    })

    test('should update microchip number', async () => {
      const dog = buildCdoDao({
        dog_microchips: [],
        registration: buildRegistrationDao({
          save: jest.fn()
        })
      })
      const editedDog = buildCdoDao({
        registration: buildRegistrationDao({
          microchip_number_recorded: new Date(),
          save: jest.fn()
        }),
        dog_microchips: [buildDogMicrochipDao({
          microchip: buildMicrochipDao({
            microchip_number: '123456789012345'
          })
        })]
      })

      sequelize.models.dog.findAll.mockResolvedValueOnce([dog])
      sequelize.models.dog.findAll.mockResolvedValueOnce([editedDog])

      const callback = jest.fn()

      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        }),
        dog: buildCdoDog({
          microchipNumber: null
        })
      }))
      expect(cdoTaskList.microchipNumberRecorded.completed).toBe(false)

      cdoTaskList.recordMicrochipNumber('123456789012345', null, callback)

      const taskList = await saveCdoTaskList(cdoTaskList, {})

      expect(updateMicrochip).toHaveBeenCalledWith(dog, '123456789012345', 1, {})
      expect(taskList.cdoSummary.microchipNumber).toEqual('123456789012345')

      expect(callback).toHaveBeenCalled()
    })

    test('should update verificationDateRecorded', async () => {
      const neuteringConfirmation = new Date()
      const microchipVerification = new Date()

      const dog = buildCdoDao({
        registration: buildRegistrationDao({
          neutering_confirmation: undefined,
          microchip_verification: undefined
        })
      })
      dog.registration.save = jest.fn()
      const editedDog = buildCdoDao({
        registration: buildRegistrationDao({
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification
        })
      })

      sequelize.models.dog.findAll.mockResolvedValueOnce([dog])
      sequelize.models.dog.findAll.mockResolvedValueOnce([editedDog])

      const callback = jest.fn()

      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          form2Sent: new Date()
        })
      }))
      expect(cdoTaskList.verificationDateRecorded.completed).toBe(false)

      cdoTaskList.verifyDates(microchipVerification, neuteringConfirmation, callback)

      const taskList = await saveCdoTaskList(cdoTaskList, {})

      expect(dog.registration.save).toHaveBeenCalled()
      expect(dog.registration.microchip_verification).toEqual(microchipVerification)
      expect(dog.registration.neutering_confirmation).toEqual(neuteringConfirmation)
      expect(taskList.cdoSummary.microchipVerification).toEqual(microchipVerification)
      expect(taskList.cdoSummary.neuteringConfirmation).toEqual(neuteringConfirmation)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    test('should update status', async () => {
      updateStatus.mockResolvedValue()
      const dog = buildCdoDao({
        registration: buildRegistrationDao({
          neutering_confirmation: new Date(),
          microchip_verification: new Date()
        })
      })
      dog.registration.save = jest.fn()

      sequelize.models.dog.findAll.mockResolvedValueOnce([dog])

      const callback = jest.fn()

      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          form2Sent: new Date(),
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          applicationFeePaid: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          applicationFeePaymentRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildInsuranceDao({
            renewalDate: new Date()
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345'
        })
      }))

      const sentDate = new Date()

      cdoTaskList.issueCertificate(sentDate, callback)

      await saveCdoTaskList(cdoTaskList, {})
      expect(callback).toHaveBeenCalled()
      expect(dog.registration.save).toHaveBeenCalled()
      expect(updateStatus).toHaveBeenCalledWith('ED300097', 'Exempt', {})
    })

    test('should handle missing model', async () => {
      sequelize.models.dog.findAll.mockResolvedValueOnce([{ registration: null }])

      const callback = jest.fn()

      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          form2Sent: new Date()
        })
      }))
      expect(cdoTaskList.verificationDateRecorded.completed).toBe(false)

      cdoTaskList.verifyDates(new Date(), new Date(), callback)

      await expect(saveCdoTaskList(cdoTaskList, {})).rejects.toThrow('Missing model')
    })
  })
})
