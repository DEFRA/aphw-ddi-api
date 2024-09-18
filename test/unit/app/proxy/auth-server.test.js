
describe('auth-server', () => {
  describe('getUserInfo', () => {
    jest.mock('@hapi/wreck')
    const wreck = require('@hapi/wreck')

    jest.mock('../../../../app/lib/environment-helpers')
    const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')

    getEnvironmentVariable.mockImplementation(envVar => {
      if (envVar === 'AUTH_SERVER_URL') {
        return 'https://dummy.com'
      }
      if (['ROBOT_SHEET_NAME'].includes(envVar)) {
        return 'dummy'
      }

      return process.env[envVar]
    })

    const { getUserInfo } = require('../../../../app/proxy/auth-server')

    beforeEach(async () => {
      wreck.get.mockResolvedValue({
        payload: { test: true }
      })
    })

    test('should be a fn', async () => {
      const token = 'ABCDEFG12345'
      const userInfo = await getUserInfo(token)
      expect(userInfo).toEqual({ test: true })
      expect(wreck.get).toHaveBeenCalledWith('https://dummy.com/userinfo', {
        json: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  })
})
