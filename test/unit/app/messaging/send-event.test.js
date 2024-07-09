const { devUser } = require('../../../mocks/auth')
const { buildCdo } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')
const { CERTIFICATE_REQUESTED } = require('../../../../app/constants/event/events')
const { SOURCE_API } = require('../../../../app/constants/event/source')

describe('SendEvent test', () => {
  jest.mock('../../../../app/messaging/create-message-sender')
  const { createMessageSender } = require('../../../../app/messaging/create-message-sender')

  const { sendEvent, sendDocumentMessage } = require('../../../../app/messaging/send-event')

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('sendEvent', () => {
    test('should throw if invalid event', async () => {
      await expect(sendEvent(null)).rejects.toThrow('Invalid event: unable to send ')
    })
  })

  describe('sendDocumentMessage', () => {
    test('should send event', async () => {
      const sendMessageMock = jest.fn()
      createMessageSender.mockReturnValue({ sendMessage: sendMessageMock })

      const cdoTaskList = new CdoTaskList(buildCdo())

      await sendDocumentMessage('abcd-123', cdoTaskList, devUser)

      expect(sendMessageMock).toHaveBeenCalledWith({
        body: {
          certificateId: 'abcd-123',
          exemptionOrder: '2015',
          user: devUser,
          owner: {
            name: 'Alex Carter',
            address: {
              line1: '300 Anywhere St',
              line2: 'Anywhere Estate',
              line3: 'City of London',
              postcode: 'S1 1AA'
            },
            organisationName: null
          },
          dog: {
            indexNumber: 'ED300097',
            microchipNumber: null,
            name: 'Rex300',
            breed: 'XL Bully',
            sex: null,
            birthDate: null,
            colour: null
          }
        },
        type: CERTIFICATE_REQUESTED,
        source: SOURCE_API
      })
    })
  })
})
