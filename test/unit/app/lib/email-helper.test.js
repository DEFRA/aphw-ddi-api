jest.mock('../../../../app/repos/police-forces')
const { lookupPoliceForceByEmail } = require('../../../../app/repos/police-forces')

jest.mock('../../../../app/messaging/send-email')
const { sendEmail } = require('../../../../app/messaging/send-email')

jest.mock('../../../../app/messaging/send-audit')
const { sendActivityToAudit } = require('../../../../app/messaging/send-audit')

const { sendReportSomethingEmails, createAuditsForReportSomething } = require('../../../../app/lib/email-helper')

describe('EmailHelper test', () => {
  beforeEach(async () => {
    lookupPoliceForceByEmail.mockResolvedValue('testforce1')
    sendEmail.mockResolvedValue()
    sendActivityToAudit.mockResolvedValue()
    jest.clearAllMocks()
  })
  test('should construct two emails', async () => {
    const payload = {
      fields: [
        { name: 'ReportedBy', value: 'testuser@email.com' },
        { name: 'Details', value: 'Some body text' }
      ]
    }
    await sendReportSomethingEmails(payload)
    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      customFields: [
        { name: 'Subject', value: 'Police correspondence received' },
        { name: 'PoliceForce', value: 'testforce1' },
        { name: 'ReportedBy', value: 'testuser@email.com' },
        { name: 'Details', value: 'Some body text' }
      ],
      toAddress: 'report-something@here.com',
      type: 'report-something'
    })
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      customFields: [
        { name: 'Subject', value: 'We\'ve received your report' },
        { name: 'PoliceForce', value: 'testforce1' },
        { name: 'ReportedBy', value: 'testuser@email.com' },
        { name: 'Details', value: 'Some body text' }
      ],
      toAddress: 'testuser@email.com',
      type: 'report-something'
    })
  })

  describe('createAuditsForReportSomething', () => {
    test('should return if null', async () => {
      const data = {}
      await createAuditsForReportSomething(data)
      expect(sendActivityToAudit).not.toHaveBeenCalled()
    })

    test('should create audit records for each dog', async () => {
      const data = { reportData: { dogs: ['ED123', 'ED456', 'ED789'] }, policeForce: 'test force 1' }
      await createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(3)
      expect(sendActivityToAudit).toHaveBeenNthCalledWith(1, {
        activity: '4',
        activityDate: expect.anything(),
        activityLabel: 'Police correspondence received from test force 1',
        activityType: 'received',
        pk: 'ED123',
        source: 'dog',
        targetPk: 'dog'
      },
      { username: data?.username, displayname: data?.username })
      expect(sendActivityToAudit).toHaveBeenNthCalledWith(2, {
        activity: '4',
        activityDate: expect.anything(),
        activityLabel: 'Police correspondence received from test force 1',
        activityType: 'received',
        pk: 'ED456',
        source: 'dog',
        targetPk: 'dog'
      },
      { username: data?.username, displayname: data?.username })
      expect(sendActivityToAudit).toHaveBeenNthCalledWith(3, {
        activity: '4',
        activityDate: expect.anything(),
        activityLabel: 'Police correspondence received from test force 1',
        activityType: 'received',
        pk: 'ED789',
        source: 'dog',
        targetPk: 'dog'
      },
      { username: data?.username, displayname: data?.username })
    })

    test('should create audit record for owner', async () => {
      const data = { reportData: { sourceType: 'owner', pk: 'P-123' }, policeForce: 'test force 1' }
      await createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit).toHaveBeenNthCalledWith(1, {
        activity: '4',
        activityDate: expect.anything(),
        activityLabel: 'Police correspondence received from test force 1',
        activityType: 'received',
        pk: 'P-123',
        source: 'owner',
        targetPk: 'owner'
      },
      { username: data?.username, displayname: data?.username })
    })
  })
})
