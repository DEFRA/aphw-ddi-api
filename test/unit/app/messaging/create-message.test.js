const { devUser } = require('../../../mocks/auth')
const { createEventMessage, createCertificateMessage, createEmailMessage } = require('../../../../app/messaging/create-message')

describe('createEventMessage', () => {
  test('should handle undefined', async () => {
    const res = createEventMessage({ type: 'type', source: 'source', id: 'id' })

    expect(res).toEqual({
      body: {
        specversion: '1.0',
        type: 'type',
        source: 'source',
        id: 'id',
        partitionKey: undefined,
        time: expect.anything(),
        subject: undefined,
        datacontenttype: 'text/json',
        data: undefined
      },
      type: 'type',
      source: 'source'
    })
  })
})

describe('createCertificateMessage', () => {
  test('should create correct content', async () => {
    const data = {
      exemption: { exemptionOrder: '2015' },
      person: {
        firstName: 'John',
        lastName: 'Smith',
        addresses: [{
          address: {
            address_line_1: 'addr1',
            address_line_2: 'addr2',
            town: 'town',
            postcode: 'postcode'
          }
        }],
        organisationName: 'My Org'
      },
      dog: {
        indexNumber: 'ED12345',
        microchipNumber: '123451234512345',
        name: 'Rex',
        breed: 'Breed 1',
        sex: 'Male',
        dateOfBirth: '2020-01-01',
        colour: 'Brown'
      }
    }
    const res = createCertificateMessage('certificateId', data, devUser)

    expect(res).toEqual({
      body: {
        certificateId: 'certificateId',
        exemptionOrder: '2015',
        user: devUser,
        owner: {
          name: 'John Smith',
          address: {
            line1: 'addr1',
            line2: 'addr2',
            line3: 'town',
            postcode: 'postcode'
          },
          organisationName: 'My Org'
        },
        dog: {
          indexNumber: 'ED12345',
          microchipNumber: '123451234512345',
          name: 'Rex',
          breed: 'Breed 1',
          sex: 'Male',
          birthDate: '2020-01-01',
          colour: 'Brown'
        }
      },
      type: 'uk.gov.defra.aphw.ddi.certificate.requested',
      source: 'aphw-ddi-api'
    })
  })

  describe('createEmailMessage', () => {
    test('should handle missing customFields', async () => {
      const res = createEmailMessage({ type: 'type', id: 'id', toAddress: 'target@email.com', customFields: null })

      expect(res).toEqual({
        specversion: '1.0',
        id: 'id',
        type: 'type',
        source: 'aphw-ddi-api',
        time: expect.anything(),
        data: {
          emailAddress: 'target@email.com',
          personalisation: {
            personalisation: {}
          }
        }
      })
    })

    test('should handle customFields', async () => {
      const customFields = [
        { name: 'oneTimeCode', value: '123456' },
        { name: 'extraField', value: 'some extra text' }
      ]
      const res = createEmailMessage({ type: 'type', id: 'id', toAddress: 'target@email.com', customFields })

      expect(res).toEqual({
        specversion: '1.0',
        id: 'id',
        type: 'type',
        source: 'aphw-ddi-api',
        time: expect.anything(),
        data: {
          emailAddress: 'target@email.com',
          personalisation: {
            personalisation: {
              oneTimeCode: '123456',
              extraField: 'some extra text'
            }
          }
        }
      })
    })
  })
})
