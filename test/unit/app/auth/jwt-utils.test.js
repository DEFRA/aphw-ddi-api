const jwt = require('jsonwebtoken')
const { keyStubs } = require('../../../mocks/auth')

describe('jwt-utils', () => {
  jest.mock('../../../../app/lib/environment-helpers')
  const { getEnvironmentVariable } = require('../../../../app/lib/environment-helpers')
  getEnvironmentVariable.mockImplementation((envVar) => {
    if (envVar === 'API_PRIVATE_KEY') {
      return keyStubs.privateKeyHash
    }

    if (envVar === 'DDI_API_BASE_URL') {
      return 'https://example.abc'
    }

    return process.env[envVar]
  })

  const { generateToken, createJwtToken, createBearerHeader } = require('../../../../app/auth/jwt-utils')

  describe('generateToken', () => {
    test('should generate a token', () => {
      const token = generateToken({ username: 'overnight-job-system-user' }, { audience: 'https://example.abc', issuer: 'abc' })
      expect(typeof token).toBe('string')

      expect(jwt.verify(token, keyStubs.publicKey)).toEqual({
        username: 'overnight-job-system-user',
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'abc',
        aud: 'https://example.abc'
      })
    })
  })

  describe('createJwtToken', () => {
    test('should generate an azure ad token', () => {
      const expected = {
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'aphw-ddi-api',
        scope: ['abc'],
        username: 'overnight-job-system-user',
        displayname: 'Overnight Job System User',
        aud: 'https://example.abc'
      }

      const token = createJwtToken('https://example.abc')('overnight-job-system-user', 'Overnight Job System User', ['abc'])

      const decodedToken = jwt.verify(
        token,
        keyStubs.publicKey,
        {
          audience: 'https://example.abc',
          algorithms: ['RS256'],
          issuer: 'aphw-ddi-api'
        })
      expect(typeof token).toBe('string')
      expect(decodedToken).toEqual(expected)
    })
  })

  describe('createBearer', () => {
    test('should create a Bearer Header', () => {
      const expected = {
        exp: expect.any(Number),
        iat: expect.any(Number),
        iss: 'aphw-ddi-api',
        scope: ['Dog.Index.Admin'],
        username: 'overnight-job-system-user',
        displayname: 'Overnight Job System User',
        aud: 'https://example.abc'
      }

      const user = {
        username: 'overnight-job-system-user',
        displayname: 'Overnight Job System User',
        scopes: ['Dog.Index.Admin']
      }
      const { Authorization } = createBearerHeader('https://example.abc')(user)

      const token = Authorization.replace('Bearer ', '')

      const decodedToken = jwt.verify(
        token,
        keyStubs.publicKey,
        {
          audience: 'https://example.abc',
          algorithms: ['RS256'],
          issuer: 'aphw-ddi-api'
        })

      expect(decodedToken).toEqual(expected)
    })
  })
})
