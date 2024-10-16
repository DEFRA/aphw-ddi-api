const { USER_ACCOUNT } = require('../../../../../app/constants/event/audit-event-object-types')

const dummyAdminUser = {
  username: 'dummy-user',
  displayname: 'Dummy User'
}

describe('UserAudit test', () => {
  jest.mock('../../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../../app/messaging/send-audit')

  const { createUserAccountAudit, deleteUserAccountAudit } = require('../../../../../app/dto/auditing/user')

  describe('createUserAccountAudit', () => {
    test('should publish audit record on creation of new user', async () => {
      const account = {
        id: 1,
        username: 'bob@example.com',
        police_force_id: 2
      }
      await createUserAccountAudit(account, dummyAdminUser)
      expect(sendCreateToAudit).toHaveBeenCalledWith(USER_ACCOUNT, account, dummyAdminUser)
    })
  })

  describe('deleteUserAccountAudit', () => {
    test('should publish audit record on deletion of new user', async () => {
      const account = {
        id: 1,
        username: 'bob@example.com',
        police_force_id: 2
      }
      await deleteUserAccountAudit(account, dummyAdminUser)

      expect(sendDeleteToAudit).toHaveBeenCalledWith(USER_ACCOUNT, account, dummyAdminUser)
    })
  })
})
