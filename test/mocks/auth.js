const { generateKeyPairSync } = require('crypto')
const { scopes } = require('../../app/constants/auth')
const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

const authHeaders = {
  headers: {
    'ddi-username': 'dev-user@test.com',
    'ddi-displayname': 'dev-user@test.com',
    authorization: 'Basic ZGV2LXVzZXJAdGVzdC5jb206QUJDREVGRzEyMzQ1Ng=='
  }
}

const mockValidate = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', user: 'dev-user@test.com', displayname: 'dev-user@test.com', scope: [scopes.admin] } }
const mockValidateStandard = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', user: 'dev-user@test.com', displayname: 'dev-user@test.com', scope: [scopes.standard] } }
const mockValidateEnforcement = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', user: 'dev-user@test.com', displayname: 'dev-user@test.com', scope: [scopes.enforcement] } }

const generateKeyStubs = () => {
  const { privateKey: privateKeyObj, publicKey: publicKeyObj } = generateKeyPairSync('rsa', {
    modulusLength: 2048
  })

  const privateKeyPem = privateKeyObj.export({ format: 'pem', type: 'pkcs8' })
  const publicKeyPem = publicKeyObj.export({ format: 'pem', type: 'spki' })

  const privateKey = privateKeyPem.toString('base64')
  const publicKey = publicKeyPem.toString('base64')

  return {
    privateKey,
    publicKey,
    privateKeyHash: Buffer.from(privateKey).toString('base64'),
    publicKeyHash: Buffer.from(publicKey).toString('base64')
  }
}

const keyStubs = generateKeyStubs()

module.exports = {
  devUser,
  authHeaders,
  mockValidate,
  mockValidateStandard,
  mockValidateEnforcement,
  keyStubs
}
