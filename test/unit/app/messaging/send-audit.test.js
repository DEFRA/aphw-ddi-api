const {
  isDataUnchanged, sendEventToAudit, sendCreateToAudit, sendActivityToAudit, sendUpdateToAudit,
  determineCreatePk, determineUpdatePk, sendDeleteToAudit, sendImportToAudit, sendChangeOwnerToAudit, sendPermanentDeleteToAudit,
  stripPermanentDeleteEntity,
  determinePermanentDeletePk
} = require('../../../../app/messaging/send-audit')

jest.mock('../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../app/messaging/send-event')
const { robotImportUser } = require('../../../../app/constants/import')
const { CDO, COURT, DOG, EXEMPTION, PERSON, POLICE, INSURANCE, USER_ACCOUNT } = require('../../../../app/constants/event/audit-event-object-types')
const { buildUserAccount } = require('../../../mocks/user-accounts')

const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

describe('SendAudit test', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('isDataUnchanged', () => {
    test('isDataUnchanged should handle null payload', () => {
      const res = isDataUnchanged(null)
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle added', () => {
      const res = isDataUnchanged('abcdef"added":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle removed', () => {
      const res = isDataUnchanged('abcdef"removed":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should handle edited', () => {
      const res = isDataUnchanged('abcdef"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return true when no data changed', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[]defghi')
      expect(res).toBe(true)
    })

    test('isDataUnchanged should return false when data added', () => {
      const res = isDataUnchanged('abcdef"added":[123],"removed":[],"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data removed', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[456],"edited":[]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data edited', () => {
      const res = isDataUnchanged('abcdef"added":[],"removed":[],"edited":[789]defghi')
      expect(res).toBe(false)
    })

    test('isDataUnchanged should return false when data added and removed', () => {
      const res = isDataUnchanged('abcdef"added":[123],"removed":[456],"edited":[]defghi')
      expect(res).toBe(false)
    })
  })

  describe('sendEventToAudit', () => {
    test('should send event to audit', async () => {
      const hal3000 = { username: 'hal-9000', displayname: 'Hal 9000' }
      await sendEventToAudit('CREATE', 'DDI Create Something', 'created something', hal3000)
      expect(sendEvent).toBeCalledWith({
        type: 'CREATE',
        source: 'aphw-ddi-portal',
        id: expect.any(String),
        partitionKey: 'CREATE',
        subject: 'DDI Create Something',
        data: {
          message: JSON.stringify({
            actioningUser: hal3000,
            operation: 'created something'
          })
        }

      })
    })

    test('should fail given no user', async () => {
      await expect(sendEventToAudit('CREATE', 'DDI Create Something', 'created something', {})).rejects.toThrow('Username and displayname are required for auditing event of CREATE')
    })

    test('should not send an event given action is a robot import', async () => {
      await sendEventToAudit('CREATE', 'DDI Create Something', 'created something', robotImportUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendCreateToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendCreateToAudit('SOMETHING', {}, {})).rejects.toThrow('Username and displayname are required for auditing creation of SOMETHING')
    })
    test('should not send an event given action is a robot import', async () => {
      await sendCreateToAudit('SOMETHING', {}, robotImportUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendActivityToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendActivityToAudit({
        activityLabel: 'LABEL',
        pk: 'l100'
      }, {})).rejects.toThrow('Username and displayname are required for auditing activity of LABEL on l100')
    })
    test('should not send an event given action is a robot import', async () => {
      await sendActivityToAudit({}, robotImportUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
    test('should send', async () => {
      await sendActivityToAudit({
        activityLabel: 'LABEL',
        pk: 'l100'
      }, devUser)
      expect(sendEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendUpdateToAudit', () => {
    test('should fail given no user', async () => {
      await expect(sendUpdateToAudit('OBJECT', {}, {}, {})).rejects.toThrow('Username and displayname are required for auditing update of OBJECT')
    })
    test('should not send an event given action is a robot import', async () => {
      await sendUpdateToAudit('OBJECT', {}, {}, robotImportUser)
      expect(sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('sendDeleteToAudit', () => {
    const hal9000 = { username: 'hal-9000', displayname: 'Hal 9000' }

    test('should fail given no user', async () => {
      await expect(sendDeleteToAudit('OBJECT', {}, {})).rejects.toThrow('Username and displayname are required for auditing deletion of OBJECT')
    })

    test('should send correct message payload', async () => {
      await sendDeleteToAudit('person', { personReference: 'P-123' }, hal9000)
      expect(sendEvent).toHaveBeenCalledWith({
        type: 'uk.gov.defra.ddi.event.delete',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-123',
        id: expect.any(String),
        subject: 'DDI Delete person',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"deleted person","deleted":{"personReference":"P-123"}}'
        }
      })
    })
  })

  describe('stripPermanentDeleteEntity', () => {
    test('should handle dogs', () => {
      const strippedAuditData = stripPermanentDeleteEntity('dog', { index_number: 'ED300005', id: '300005', name: 'Rex' })
      expect(strippedAuditData).toEqual({ indexNumber: 'ED300005' })
    })

    test('should handle person', () => {
      const strippedAuditData = stripPermanentDeleteEntity('person', { id: '5', firstName: 'Jane', lastName: 'Doe', person_reference: 'P-1234-56' })
      expect(strippedAuditData).toEqual({ personReference: 'P-1234-56' })
    })

    test('should throw an error', () => {
      expect(() => stripPermanentDeleteEntity('exemption', { id: '5' })).toThrow('Invalid object for permanent delete audit: exemption')
    })
  })

  describe('determinePermanentDeletePk', () => {
    test('should handle dogs', () => {
      const dogPk = determinePermanentDeletePk('dog', { index_number: 'ED300005', id: '300005', name: 'Rex' })
      expect(dogPk).toBe('ED300005')
    })

    test('should handle person', () => {
      const ownerPk = determinePermanentDeletePk('person', { id: '5', firstName: 'Jane', lastName: 'Doe', person_reference: 'P-1234-56' })
      expect(ownerPk).toEqual('P-1234-56')
    })

    test('should throw an error', () => {
      expect(() => determinePermanentDeletePk('exemption', { id: '5' })).toThrow('Invalid object for permanent delete audit: exemption')
    })
  })

  describe('sendPermanentDeleteToAudit', () => {
    const hal9000 = { username: 'hal-9000', displayname: 'Hal 9000' }
    test('should fail given no user', async () => {
      await expect(sendPermanentDeleteToAudit('OBJECT', {}, {})).rejects.toThrow('Username and displayname are required for auditing deletion of OBJECT')
    })

    test('should send correct message payload', async () => {
      await sendPermanentDeleteToAudit('person', { personReference: 'P-123', id: 1, firstName: 'Test' }, hal9000)
      expect(sendEvent).toHaveBeenCalledWith({
        type: 'uk.gov.defra.ddi.event.delete.permanent',
        source: 'aphw-ddi-api',
        partitionKey: 'P-123',
        id: expect.any(String),
        subject: 'DDI Permanently delete person',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"permanently deleted person","deleted":{"personReference":"P-123"}}'
        }
      })
    })
  })

  describe('sendChangeOwnerToAudit', () => {
    const hal9000 = { username: 'hal-9000', displayname: 'Hal 9000' }

    test('should fail given no user', async () => {
      await expect(sendChangeOwnerToAudit({}, {})).rejects.toThrow('Username and displayname are required for auditing of ChangeOwner')
    })

    test('should send correct message payload', async () => {
      const entity = {
        index_number: 'ED100',
        changedOwner: {
          oldOwner: {
            firstName: 'John',
            lastName: 'Smith',
            personReference: 'P-123'
          },
          newOwner: {
            firstName: 'Peter',
            lastName: 'Snow',
            personReference: 'P-456'
          }
        }
      }
      await sendChangeOwnerToAudit(entity, hal9000)

      expect(sendEvent).toHaveBeenCalledTimes(3)

      expect(sendEvent.mock.calls[0]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'ED100',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"changed dog owner","details":"Owner changed from John Smith"}'
        }
      }])

      expect(sendEvent.mock.calls[1]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-123',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"changed dog owner","details":"Dog ED100 moved to Peter Snow"}'
        }
      }])

      expect(sendEvent.mock.calls[2]).toEqual([{
        type: 'uk.gov.defra.ddi.event.change.owner',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-456',
        id: expect.any(String),
        subject: 'DDI Changed Dog Owner',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"changed dog owner","details":"Dog ED100 moved from John Smith"}'
        }
      }])
    })
  })

  describe('sendImportToAudit', () => {
    const hal9000 = { username: 'hal-9000', displayname: 'Hal 9000' }

    test('should fail given no user', async () => {
      await expect(sendImportToAudit({}, {})).rejects.toThrow('Username and displayname are required for auditing import of records')
    })

    test('should send correct message payload', async () => {
      await sendImportToAudit({
        dogs: [
          { indexNumber: 'ED123' },
          { indexNumber: 'ED234' }
        ]
      }, hal9000)
      expect(sendEvent).toHaveBeenCalledTimes(2)
      /*
      {
        type: 'uk.gov.defra.ddi.event.delete',
        source: 'aphw-ddi-portal',
        partitionKey: 'P-123',
        id: expect.any(String),
        subject: 'DDI Delete person',
        data: {
          message: '{"actioningUser":{"username":"hal-9000","displayname":"Hal 9000"},"operation":"deleted person","deleted":{"personReference":"P-123"}}'
        }
      })
      */
    })
  })

  describe('determineCreatePk', () => {
    test('should get court id if obj is a court', () => {
      const court = { id: 3, name: 'Metropolis City Court' }
      const pk = determineCreatePk(COURT, court)

      expect(pk).toBe('3')
    })

    test('should get police force id if obj is a court', () => {
      const policeForce = { id: 3, name: 'Metropolis Police Department' }
      const pk = determineCreatePk(POLICE, policeForce)

      expect(pk).toBe('3')
    })

    test('should get index number of CDO', () => {
      const entity = { id: 1, dog: { index_number: 'ED123', name: 'my dog' } }
      const pk = determineCreatePk(CDO, entity)

      expect(pk).toBe('ED123')
    })

    test('should get index number of dog', () => {
      const entity = { id: 1, index_number: 'ED123', name: 'my dog' }
      const pk = determineCreatePk(DOG, entity)

      expect(pk).toBe('ED123')
    })

    test('should get id of user account', () => {
      const entity = { id: 1, username: 'joe@bloggs.co.uk', police_force_id: 1 }
      const pk = determineCreatePk(USER_ACCOUNT, entity)

      expect(pk).toBe('1')
    })

    test('should throw for invalid object', () => {
      const entity = { id: 1, index_number: 'ED123', name: 'my dog' }
      expect(() => determineCreatePk('invalid', entity)).toThrow('Invalid object for create audit: invalid')
    })
  })

  describe('determineUpdatePk', () => {
    test('should get court id if obj is a court', () => {
      const court = { id: 3, name: 'Metropolis City Court' }
      const pk = determineUpdatePk(COURT, court)

      expect(pk).toBe('3')
    })

    test('should get police force id if obj is a police force', () => {
      const policeForce = { id: 3, name: 'Metropolis Police Department' }
      const pk = determineUpdatePk(POLICE, policeForce)

      expect(pk).toBe('3')
    })

    test('should get insurance company id if obj is an insurance company', () => {
      const insuranceCompany = { id: 3, name: 'Pets R Us' }
      const pk = determineUpdatePk(INSURANCE, insuranceCompany)

      expect(pk).toBe('3')
    })

    test('should get reference number of person', () => {
      const entity = { id: 1, personReference: 'P-123', first_name: 'John' }
      const pk = determineUpdatePk(PERSON, entity)

      expect(pk).toBe('P-123')
    })

    test('should get index number of dog', () => {
      const entity = { id: 1, index_number: 'ED123', name: 'my dog' }
      const pk = determineUpdatePk(DOG, entity)

      expect(pk).toBe('ED123')
    })

    test('should get index number of exemption', () => {
      const entity = { id: 1, index_number: 'ED123', name: 'my dog' }
      const pk = determineUpdatePk(EXEMPTION, entity)

      expect(pk).toBe('ED123')
    })

    test('should get id of USER_ACCOUNT', () => {
      const entity = buildUserAccount({ id: 1 })
      const pk = determineUpdatePk(USER_ACCOUNT, entity)

      expect(pk).toBe('1')
    })

    test('should throw for invalid object', () => {
      const entity = { id: 1, index_number: 'ED123', name: 'my dog' }
      expect(() => determineUpdatePk('invalid', entity)).toThrow('Invalid object for update audit: invalid')
    })
  })
})
