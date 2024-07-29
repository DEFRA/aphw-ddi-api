const { devUser } = require('../../../mocks/auth')
const { createMessage, createCertificateMessage } = require('../../../../app/messaging/create-message')

describe('createMessage', () => {
  test('createMessage should handle undefined', async () => {
    const res = createMessage({ type: 'type', source: 'source', id: 'id' })

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

  test('createCertificateMessage should create correct content', async () => {
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
})
