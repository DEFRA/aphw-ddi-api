const { comments } = require('../../../../../mocks/comments')
const { createCommentAuditMessage, sendCommentEvent } = require('../../../../../../app/import/access/backlog/send-comment-event')

jest.mock('../../../../../../app/messaging/send-event')
const { sendEvent } = require('../../../../../../app/messaging/send-event')

describe('send-comment-event', () => {
  describe('createCommentAuditMessage', () => {
    test('should build comment audit message', () => {
      const commentModel = {
        dataValues: comments[0]
      }
      const dogIndexNumber = 'ED300277'
      const actioningUser = 'db-import'

      expect(createCommentAuditMessage(commentModel, dogIndexNumber, actioningUser)).toEqual({
        actioningUser,
        operation: 'added comment',
        added: {
          id: 2124,
          registration_id: 2631,
          comment: 'Ratione voluptatibus officiis totam cupiditate hic. Consequatur tempore rem qui aperiam ratione. Iure cupiditate blanditiis eos ea odio eius.',
          cdo_issued: '2016-07-20',
          dog_index_number: dogIndexNumber
        }
      })
    })
  })

  describe('sendCommentEvent', () => {
    test('should send a comment event', async () => {
      const commentModel = {
        dataValues: comments[0],
        registration: comments[0].registration
      }

      await sendCommentEvent(commentModel)
      expect(sendEvent).toBeCalledWith(expect.objectContaining({
        type: 'uk.gov.defra.ddi.event.import',
        source: 'aphw-ddi-portal',
        subject: 'DDI Import Comment',
        partitionKey: 'ED27995',
        data: {
          message: expect.any(String)
        }
      }))
    })
  })
})
