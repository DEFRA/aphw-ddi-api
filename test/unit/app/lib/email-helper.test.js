jest.mock('../../../../app/repos/police-forces')
const { lookupPoliceForceByEmail } = require('../../../../app/repos/police-forces')

jest.mock('../../../../app/messaging/send-email')
const { sendEmail } = require('../../../../app/messaging/send-email')

jest.mock('../../../../app/messaging/send-audit')
const { sendActivityToAudit } = require('../../../../app/messaging/send-audit')

const emailHelper = require('../../../../app/lib/email-helper')
const { reportSomethingAudit, reportTypes } = require('../../../../app/constants/email-types')

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
    await emailHelper.sendReportSomethingEmails(payload)
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
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).not.toHaveBeenCalled()
    })

    test('should create audit record for Report Dog in Breach on dog page', async () => {
      const data = { reportData: { sourceType: 'dog', personReference: 'P-BBDC-8579', pk: 'ED300002', dogs: ['ED300002'], reportType: 'in-breach', subTitle: 'Dog ED300002', dogChosen: { indexNumber: 'ED300002' }, dogBreaches: ['Dog not kept on lead or muzzled in public place', 'Dog kept in insecure place', 'Dog away from registered address for over 30 days in a 12-month period'] }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual({
        activityId: expect.any(String),
        activity: reportSomethingAudit.id,
        activityType: reportSomethingAudit.activityType,
        pk: 'ED300002',
        source: 'dog',
        activityDate: expect.any(Date),
        targetPk: 'dog',
        activityLabel: expect.any(String),
        reportType: reportTypes.inBreach
      })
      expect(sendActivityToAudit.mock.calls[0][0].activityLabel).toBe('Police correspondence from dallas.police.gov')
    })

    test('should create audit record for Report Change of Address on dog page', async () => {
      const data = { reportData: { sourceType: 'dog', personReference: 'P-BBDC-8579', pk: 'ED300002', dogs: ['ED300002', 'ED300003'], reportType: 'changed-address', subTitle: 'Dog ED300002', postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=eb44-6167', srcHashParam: '?src=8169-35cb', addressLine1: '2 Lonsdale Road', town: 'Oxford', country: 'England', sorting: '0002 0000' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(3)
      expect(sendActivityToAudit.mock.calls[0][0].activityId).toBe(sendActivityToAudit.mock.calls[1][0].activityId)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.changedAddress
      }))
      expect(sendActivityToAudit.mock.calls[1][0]).toEqual(expect.objectContaining({
        pk: 'ED300003',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.changedAddress
      }))
      expect(sendActivityToAudit.mock.calls[2][0]).toEqual(expect.objectContaining({
        pk: 'P-BBDC-8579',
        source: 'owner',
        targetPk: 'owner',
        reportType: reportTypes.changedAddress
      }))
    })

    test('should create audit record for Report Dog Died on dog page', async () => {
      const data = { reportData: { sourceType: 'dog', personReference: 'P-BBDC-8579', pk: 'ED300002', dogs: ['ED300002'], reportType: 'dog-died', subTitle: 'Dog ED300002', postcode: 'ox2 7ew', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=eb44-6167', srcHashParam: '?src=1516-925f', dogChosen: { indexNumber: 'ED300002' }, 'dateOfDeath-day': 1, 'dateOfDeath-month': 1, 'dateOfDeath-year': 2023, dateOfDeath: '2023-01-01T00:00:00.000Z' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.dogDied
      }))
    })

    test('should create audit record for Something else on dog page', async () => {
      const data = { reportData: { sourceType: 'dog', personReference: 'P-BBDC-8579', pk: 'ED300002', dogs: ['ED300002'], reportType: 'something-else', subTitle: 'Dog ED300002', postcode: 'ox2 7ew', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=eb44-6167', srcHashParam: '?src=1516-925f', dogChosen: { indexNumber: 'ED300002' }, details: 'lorem ipsum dolar sit amet' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(2)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.somethingElse
      }))
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.somethingElse
      }))
    })

    test('should create audit record for Report Dog in Breach on owner page', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED300003'], reportType: 'in-breach', subTitle: 'Berenice EDITED Lang EDITED', dogChosen: { indexNumber: 'ED300003' }, dogBreaches: ['Dog kept in insecure place', 'Dog away from registered address for over 30 days in a 12-month period', 'Exemption certificate not provided to police within five days of request'] }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300003',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.inBreach
      }))
    })

    test('should create audit record for Report Change of Address on owner page', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED300002'], reportType: 'changed-address', subTitle: 'Berenice EDITED Lang EDITED', postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=ba5c-c435', srcHashParam: '?src=5b35-dcb1', addressLine1: '2 Lonsdale Road', town: 'Oxford', country: 'England', sorting: '0002 0000' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(2)
      expect(sendActivityToAudit.mock.calls[0][0].activityId).toBe(sendActivityToAudit.mock.calls[1][0].activityId)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.changedAddress
      }))
      expect(sendActivityToAudit.mock.calls[1][0]).toEqual(expect.objectContaining({
        pk: 'P-BBDC-8579',
        source: 'owner',
        targetPk: 'owner',
        reportType: reportTypes.changedAddress
      }))
    })

    test('should create audit record for Report Dog Died on owner page', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED300002'], reportType: 'dog-died', subTitle: 'Berenice EDITED Lang EDITED', dogChosen: { indexNumber: 'ED300002' }, postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=ba5c-c435', srcHashParam: '?src=5852-81ae', 'dateOfDeath-day': 1, 'dateOfDeath-month': 1, 'dateOfDeath-year': 2023, dateOfDeath: '2023-01-01T00:00:00.000Z' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.dogDied
      }))
    })

    test('should create audit record for Report Dog Died on owner page with multiple dogs and none chosen', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED300002', 'ED300003'], reportType: 'dog-died', subTitle: 'Berenice EDITED Lang EDITED', postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=ba5c-c435', srcHashParam: '?src=5852-81ae', 'dateOfDeath-day': 1, 'dateOfDeath-month': 1, 'dateOfDeath-year': 2023, dateOfDeath: '2023-01-01T00:00:00.000Z' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(2)
      expect(sendActivityToAudit.mock.calls[0][0].activityId).toBe(sendActivityToAudit.mock.calls[1][0].activityId)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300002',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.dogDied
      }))
      expect(sendActivityToAudit.mock.calls[1][0]).toEqual(expect.objectContaining({
        pk: 'ED300003',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.dogDied
      }))
    })

    test('should create audit record for Report Dog Died on owner page with dog chosen', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', dogChosen: { indexNumber: 'ED300000', arrayInd: 1 }, personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED300002', 'ED300000'], reportType: 'dog-died', subTitle: 'Berenice EDITED Lang EDITED', postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=ba5c-c435', srcHashParam: '?src=5852-81ae', 'dateOfDeath-day': 1, 'dateOfDeath-month': 1, 'dateOfDeath-year': 2023, dateOfDeath: '2023-01-01T00:00:00.000Z' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(1)
      expect(sendActivityToAudit.mock.calls[0][0]).toEqual(expect.objectContaining({
        pk: 'ED300000',
        source: 'dog',
        targetPk: 'dog',
        reportType: reportTypes.dogDied
      }))
    })

    test('should create audit record for Something else on owner page', async () => {
      const data = { reportData: { sourceType: 'owner', firstName: 'Berenice EDITED', lastName: 'Lang EDITED', personReference: 'P-BBDC-8579', pk: 'P-BBDC-8579', dogs: ['ED123', 'ED456', 'ED789'], reportType: 'something-else', subTitle: 'Berenice EDITED Lang EDITED', postcode: 'OX2 7EW', houseNumber: '', backLink: 'http://localhost:3003/cdo/report/postcode-lookup?src=ba5c-c435', srcHashParam: '?src=5852-81ae', details: 'lorem ipsum dolar sit amet' }, policeForce: 'dallas.police.gov', username: 'robocop@dallas.police.gov' }
      await emailHelper.createAuditsForReportSomething(data)
      expect(sendActivityToAudit).toHaveBeenCalledTimes(4)
      expect(sendActivityToAudit.mock.calls[3][0]).toEqual(expect.objectContaining({
        pk: 'P-BBDC-8579',
        source: 'owner',
        targetPk: 'owner',
        reportType: reportTypes.somethingElse
      }))
    })
  })

  describe('sendForm2Emails', () => {
    test('should send emails', async () => {
      lookupPoliceForceByEmail.mockResolvedValue('Shire Citizens Police')
      const indexNumber = 'ED300100'
      const dogName = 'Pip'
      const microchipNumber = '123456789012345'
      const unfit = false
      const microchipDate = '02/12/2024'
      const neuteringDate = '01/12/2024'
      const under16 = false
      const username = 'bilbo.baggins@shire.police.me'

      const expectedDataDefra = {
        toAddress: 'report-something@here.com',
        type: 'form2-submission-to-defra',
        customFields: [
          { name: 'police_force', value: 'Shire Citizens Police' },
          { name: 'submitted_by', value: username },
          { name: 'index_number', value: indexNumber },
          { name: 'dog_name', value: dogName },
          { name: 'microchip_number', value: microchipNumber },
          { name: 'unfit_to_microchip', value: 'no' },
          { name: 'microchip_date', value: microchipDate },
          { name: 'neutering_date', value: neuteringDate },
          { name: 'under_16_months', value: 'no' }
        ]
      }

      const expectedDataPolice = {
        toAddress: username,
        type: 'form2-confirmation-to-police',
        customFields: [
          { name: 'index_number', value: indexNumber },
          { name: 'dog_name', value: dogName },
          { name: 'microchip_number', value: microchipNumber },
          { name: 'unfit_to_microchip', value: 'no' },
          { name: 'microchip_date', value: microchipDate },
          { name: 'neutering_date', value: neuteringDate },
          { name: 'under_16_months', value: 'no' }
        ]
      }

      await emailHelper.sendForm2Emails(indexNumber, dogName, microchipNumber, unfit, microchipDate, neuteringDate, under16, username)
      expect(lookupPoliceForceByEmail).toHaveBeenCalledWith(username)
      expect(sendEmail).toHaveBeenNthCalledWith(1, expectedDataDefra)
      expect(sendEmail).toHaveBeenNthCalledWith(2, expectedDataPolice)
    })

    test('should send emails', async () => {
      lookupPoliceForceByEmail.mockResolvedValue('Shire Citizens Police')
      const indexNumber = 'ED300100'
      const dogName = 'Pip'
      const microchipNumber = ''
      const unfit = true
      const microchipDate = '02/12/2024'
      const neuteringDate = ''
      const under16 = true
      const username = 'bilbo.baggins@shire.police.me'

      const expectedDataDefra = {
        toAddress: 'report-something@here.com',
        type: 'form2-submission-to-defra',
        customFields: [
          { name: 'police_force', value: 'Shire Citizens Police' },
          { name: 'submitted_by', value: username },
          { name: 'index_number', value: indexNumber },
          { name: 'dog_name', value: dogName },
          { name: 'microchip_number', value: microchipNumber },
          { name: 'unfit_to_microchip', value: 'yes' },
          { name: 'microchip_date', value: microchipDate },
          { name: 'neutering_date', value: '' },
          { name: 'under_16_months', value: 'yes' }
        ]
      }

      await emailHelper.sendForm2Emails(indexNumber, dogName, microchipNumber, unfit, microchipDate, neuteringDate, under16, username)
      expect(lookupPoliceForceByEmail).toHaveBeenCalledWith(username)
      expect(sendEmail).toHaveBeenNthCalledWith(1, expectedDataDefra)
    })
  })
})
