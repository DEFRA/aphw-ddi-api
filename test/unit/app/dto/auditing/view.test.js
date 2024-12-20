const { buildCdoDao, buildRegisteredPersonDao, buildPersonDao, buildDogDao } = require('../../../../mocks/cdo/get')
const { VIEW_DOG, VIEW_OWNER, SEARCH, VIEW_OWNER_ACTIVITY, VIEW_DOG_ACTIVITY } = require('../../../../../app/constants/event/events')
const { buildCdoTaskListDto } = require('../../../../mocks/cdo/dto')

describe('view audit', () => {
  jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('816bbb6e-5df5-434b-8ec3-b6705ff7a2a7')
  }))
  const roboCop = { username: 'robocop@detroit.police.gov', displayname: 'Robocop', origin: 'aphw-ddi-enforcement' }

  const {
    determineViewAuditPk,
    auditOwnerDetailsView,
    auditOwnerActivityView,
    auditDogDetailsView,
    auditDogActivityView,
    auditDogCdoProgressView,
    auditSearch,
    constructViewDetails
  } = require('../../../../../app/dto/auditing/view')

  jest.mock('../../../../../app/messaging/send-audit')
  const { sendViewToAudit } = require('../../../../../app/messaging/send-audit')

  const dogEntity = buildCdoDao({
    index_number: 'ED300097'
  })

  const ownerEntity = [buildRegisteredPersonDao({
    person: buildPersonDao({
      person_reference: 'P-8AD0-561A'
    }),
    dog: dogEntity
  })]

  const singleOwnerEntity = buildRegisteredPersonDao({
    person_reference: 'P-8AD0-561A'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('determineViewAuditPk', () => {
    test('should get Cdo Dog Index Number', () => {
      const pk = determineViewAuditPk(VIEW_DOG, dogEntity)
      expect(pk).toBe('ED300097')
    })

    test('should get Owner pk', () => {
      const pk = determineViewAuditPk(VIEW_OWNER, ownerEntity)
      expect(pk).toBe('P-8AD0-561A')
    })

    test('should get Owner pk given VIEW_OWNER_ACTIVITY call', () => {
      const pk = determineViewAuditPk(VIEW_OWNER_ACTIVITY, singleOwnerEntity)
      expect(pk).toBe('P-8AD0-561A')
    })

    test('should get search term', () => {
      const entity = 'search term'
      const pk = determineViewAuditPk(SEARCH, entity)
      expect(pk).toBe('816bbb6e-5df5-434b-8ec3-b6705ff7a2a7')
    })

    test('should throw for invalid object', () => {
      const entity = buildCdoDao()
      expect(() => determineViewAuditPk('invalid', entity)).toThrow('Invalid object for view audit: invalid')
    })

    test('should throw for missing parameter', () => {
      const entity = buildRegisteredPersonDao({
        person: undefined
      })
      expect(() => determineViewAuditPk(VIEW_OWNER, entity)).toThrowError()
    })
  })

  describe('constructViewDetails', () => {
    test('should construct VIEW_DOG details', () => {
      const cdo = buildCdoDao({ index_number: 'ED300001' })
      const cdoDetails = constructViewDetails(VIEW_DOG, cdo)
      expect(cdoDetails).toEqual({
        pk: 'ED300001'
      })
    })

    test('should construct SEARCH details', () => {
      const searchTerms = '12 Anywhere Str'
      const searchDetails = constructViewDetails(SEARCH, { searchTerms, fuzzy: true, national: true })
      expect(searchDetails).toEqual({
        pk: '816bbb6e-5df5-434b-8ec3-b6705ff7a2a7',
        searchTerms: '12 Anywhere Str',
        fuzzy: true,
        national: true
      })
    })

    test('should construct VIEW_OWNER details', () => {
      const person1 = buildRegisteredPersonDao({
        person: buildPersonDao({
          person_reference: 'P-1233-555'
        }),
        dog: buildDogDao({
          index_number: 'ED300001'
        })
      })
      const person2 = buildRegisteredPersonDao({
        person: buildPersonDao({
          person_reference: 'P-1233-555'
        }),
        dog: buildDogDao({
          index_number: 'ED300002'
        })
      })
      const cdoDetails = constructViewDetails(VIEW_OWNER, [person1, person2])
      expect(cdoDetails).toEqual({
        pk: 'P-1233-555',
        dogIndexNumbers: ['ED300001', 'ED300002']
      })
    })

    test('should construct VIEW_OWNER details where owner has no dogs', () => {
      const person1 = buildRegisteredPersonDao({
        person: buildPersonDao({
          person_reference: 'P-1233-555'
        }),
        dog: null
      })
      const person2 = buildRegisteredPersonDao({
        person: buildPersonDao({
          person_reference: 'P-1233-555'
        }),
        dog: null
      })
      const cdoDetails = constructViewDetails(VIEW_OWNER, [person1, person2])
      expect(cdoDetails).toEqual({
        pk: 'P-1233-555',
        dogIndexNumbers: []
      })
    })

    test('should construct VIEW_OWNER_ACTIVITY details', () => {
      const person = buildPersonDao({
        person_reference: 'P-1233-555'
      })
      const cdoDetails = constructViewDetails(VIEW_OWNER_ACTIVITY, person)
      expect(cdoDetails).toEqual({
        pk: 'P-1233-555'
      })
    })
  })

  describe('auditOwnerDetailsView', () => {
    test('should send a VIEW_OWNER audit event', async () => {
      await auditOwnerDetailsView(ownerEntity, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        'P-8AD0-561A',
        VIEW_OWNER,
        'enforcement user viewed owner details',
        {
          pk: 'P-8AD0-561A',
          dogIndexNumbers: ['ED300097']
        },
        roboCop)
    })

    test('should not audit a request from portal', async () => {
      await auditOwnerDetailsView(ownerEntity, {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })

  describe('auditOwnerActivityView', () => {
    test('should send a VIEW_OWNER_ACTIVITY audit event', async () => {
      const person = buildPersonDao({
        person_reference: 'P-8AD0-561A'
      })
      await auditOwnerActivityView(person, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        'P-8AD0-561A',
        VIEW_OWNER_ACTIVITY,
        'enforcement user viewed owner activity',
        {
          pk: 'P-8AD0-561A'
        },
        roboCop)
    })

    test('should not audit a request from portal', async () => {
      await auditOwnerActivityView(ownerEntity[0], {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })

  describe('auditDogDetailsView', () => {
    test('should record a VIEW_DOG event', async () => {
      await auditDogDetailsView(dogEntity, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        'ED300097',
        VIEW_DOG,
        'enforcement user viewed dog details',
        {
          pk: 'ED300097'
        },
        roboCop)
    })

    test('should not audit a request from portal', async () => {
      await auditDogDetailsView(dogEntity, {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })

  describe('auditDogActivityView', () => {
    test('should record a VIEW_DOG event', async () => {
      await auditDogActivityView(dogEntity, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        'ED300097',
        VIEW_DOG_ACTIVITY,
        'enforcement user viewed dog activity',
        {
          pk: 'ED300097'
        },
        roboCop)
      expect(auditDogActivityView).toBeInstanceOf(Function)
    })

    test('should not audit a request from portal', async () => {
      await auditDogActivityView(dogEntity, {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })

  describe('auditDogCdoProgressView', () => {
    test('should record a VIEW_DOG event', async () => {
      const taskList = buildCdoTaskListDto()
      await auditDogCdoProgressView(taskList, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        'ED300097',
        VIEW_DOG,
        'enforcement user viewed dog details - CDO progress',
        {
          pk: 'ED300097'
        },
        roboCop)
    })

    test('should not audit a request from portal', async () => {
      await auditDogCdoProgressView(dogEntity, {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })

  describe('auditSearch', () => {
    const searchTerms = '12 Badbury Drive'

    test('should record a SEARCH audit event', async () => {
      await auditSearch(searchTerms, { fuzzy: false, national: true }, roboCop)
      expect(sendViewToAudit).toHaveBeenCalledWith(
        '816bbb6e-5df5-434b-8ec3-b6705ff7a2a7',
        SEARCH,
        'enforcement user performed search',
        {
          pk: '816bbb6e-5df5-434b-8ec3-b6705ff7a2a7',
          searchTerms,
          fuzzy: false,
          national: true
        },
        roboCop)
    })

    test('should not audit a request from portal', async () => {
      await auditSearch(searchTerms, undefined, {
        username: 'dev-user@example.com',
        displayname: 'Dev User',
        origin: 'aphw-ddi-portal'
      })
      expect(sendViewToAudit).not.toHaveBeenCalled()
    })
  })
})
