describe('user-accounts', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      user_account: {
        findOne: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const { isAccountEnabled } = require('../../../../app/repos/user-accounts')

  describe('isAccountEnabled', () => {
    test('should return true if activated date', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: new Date('2024-08-31'),
        last_login_date: new Date('2024-09-02')
      })

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(true)
    })

    test('should return false if user exists but is not activated', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue({
        id: 1,
        username: 'test@example.com',
        telephone: '01406946277',
        activation_token: 'ABCDE12345',
        activated_date: null,
        last_login_date: new Date('2024-09-02')
      })

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(false)
    })

    test('should return false if user does not exist', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)

      const result = await isAccountEnabled('test@example.com')
      expect(result).toBe(false)
    })
  })
})
