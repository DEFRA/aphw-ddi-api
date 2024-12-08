const { buildCdo, buildExemption, buildCdoInsurance, buildCdoDog, buildCdoTaskList } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')
const { devUser } = require('../../../mocks/auth')
const { ActionAlreadyPerformedError } = require('../../../../app/errors/domain/actionAlreadyPerformed')

describe('CdoService', function () {
  /**
   * @type {CdoRepository}
   */
  let mockCdoRepository
  let cdoService

  const { CdoService } = require('../../../../app/service/cdo')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendActivityToAudit, sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/repos/activity')
  const { getActivityByLabel } = require('../../../../app/repos/activity')

  jest.mock('../../../../app/repos/microchip')
  const { microchipExists } = require('../../../../app/repos/microchip')

  jest.mock('../../../../app/lib/email-helper')
  const { sendForm2Emails } = require('../../../../app/lib/email-helper')

  beforeEach(function () {
    jest.clearAllMocks()

    // Create a mock CdoRepository
    /**
     * @type {CdoRepository}
     */
    mockCdoRepository = {
      getCdo: jest.fn(),
      getAllCdos: jest.fn(),
      getCdoModel: jest.fn(),
      getCdoTaskList: jest.fn(),
      getSummaryCdos: jest.fn(),
      createCdo: jest.fn(),
      saveCdoTaskList: jest.fn(),
      submitFormTwo: jest.fn()
    }

    // Instantiate CdoService with the mock repository
    cdoService = new CdoService(mockCdoRepository)
  })

  describe('getTaskList', function () {
    test('should call getCdo with the correct cdoId', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.getTaskList(cdoIndexNumber)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(result).toEqual(cdoTaskList)
    })
  })

  describe('sendApplicationPack', () => {
    test('should send application pack', async () => {
      getActivityByLabel.mockResolvedValue({ id: 9, label: 'Application pack' })
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.sendApplicationPack(cdoIndexNumber, sentDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 9,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Application pack'
      }, devUser)
      sendActivityToAudit.mockClear()
    })

    test('should not send application pack a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03')
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.sendApplicationPack(cdoIndexNumber, new Date(), devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.sendApplicationPack(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('processApplicationPack', () => {
    test('should process application pack', async () => {
      getActivityByLabel.mockResolvedValue({ id: 9, label: 'Application pack' })
      const processedDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.processApplicationPack(cdoIndexNumber, processedDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackProcessed',
        value: processedDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 9,
        activityType: 'processed',
        pk: 'ED300097',
        source: 'dog',
        activityDate: processedDate,
        targetPk: 'dog',
        activityLabel: 'Application pack'
      }, devUser)
      sendActivityToAudit.mockClear()
    })

    test('should not process an application pack a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03'),
          applicationPackProcessed: new Date('2024-05-03')
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.processApplicationPack(cdoIndexNumber, new Date(), devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.processApplicationPack(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('recordInsuranceDetails', () => {
    test('should record insurance details', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const inTheFuture = new Date('9999-01-01')

      const result = await cdoService.recordInsuranceDetails(cdoIndexNumber, {
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: inTheFuture
      }, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([
        {
          key: 'insuranceDetailsRecorded',
          value: expect.any(Date)
        },
        {
          key: 'insurance',
          value: {
            company: 'Dog\'s Trust',
            renewalDate: inTheFuture
          },
          callback: expect.any(Function)
        }])
      await cdoTaskList.getUpdates().exemption[1].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          insurance_company: null,
          insurance_renewal_date: null
        },
        {
          index_number: 'ED300097',
          insurance_company: "Dog's Trust",
          insurance_renewal_date: '9999-01-01'
        }, devUser)
    })
  })

  describe('recordMicrochipNumber', () => {
    test('should record microchip number', async () => {
      microchipExists.mockResolvedValue(null)

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const microchipNumber = '123456789012345'

      expect(cdoTaskList.microchipNumberRecorded.completed).toBe(false)

      const result = await cdoService.recordMicrochipNumber(cdoIndexNumber, {
        microchipNumber
      }, devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(microchipExists).toHaveBeenCalledWith(300097, '123456789012345')
      expect(cdoTaskList.microchipNumberRecorded.completed).toBe(true)
      expect(cdoTaskList.getUpdates().dog).toEqual([{
        key: 'microchip',
        value: microchipNumber,
        callback: expect.any(Function)
      }])

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      await cdoTaskList.getUpdates().dog[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          microchip1: null
        },
        {
          index_number: 'ED300097',
          microchip1: '123456789012345'
        }, devUser)
    })
  })

  describe('recordApplicationFee', () => {
    test('should record application fee', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const applicationFeePaid = new Date('2024-07-03')

      expect(cdoTaskList.applicationFeePaid.completed).toBe(false)

      const result = await cdoService.recordApplicationFee(
        cdoIndexNumber,
        {
          applicationFeePaid
        },
        devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(cdoTaskList.applicationFeePaid.completed).toBe(true)
      expect(cdoTaskList.getUpdates().exemption).toEqual([
        {
          key: 'applicationFeePaymentRecorded',
          value: expect.any(Date)
        },
        {
          key: 'applicationFeePaid',
          value: applicationFeePaid,
          callback: expect.any(Function)
        }])

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      await cdoTaskList.getUpdates().exemption[1].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          application_fee_paid: null
        },
        {
          index_number: 'ED300097',
          application_fee_paid: applicationFeePaid
        }, devUser)
    })
  })

  describe('sendForm2', () => {
    test('should send Form 2', async () => {
      getActivityByLabel.mockResolvedValue({ id: 10, label: 'Form 2' })
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.sendForm2(cdoIndexNumber, sentDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'form2Sent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 10,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Form 2'
      }, devUser)
    })

    test('should not send Form 2 a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03'),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.sendForm2(cdoIndexNumber, new Date(), devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.sendForm2(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('verifyDates', () => {
    test('should verifyDates', async () => {
      const microchipVerification = new Date('2024-07-03')
      const neuteringConfirmation = new Date('2024-07-03')

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification,
        neuteringConfirmation
      }, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'verificationDateRecorded',
        value: {
          microchipVerification,
          neuteringConfirmation,
          microchipDeadline: null,
          neuteringDeadline: null,
          verificationDatesRecorded: expect.any(Date)
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null,
          neutering_deadline: null,
          microchip_deadline: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification,
          neutering_deadline: null,
          microchip_deadline: null
        }, devUser)
    })

    test('should verifyDates given dogNotFitForMicrochip and dogNotNeutered', async () => {
      const microchipVerification = undefined
      const neuteringConfirmation = undefined
      const microchipDeadline = new Date(`${new Date().getUTCFullYear() + 1}-07-03`)

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        }),
        dog: buildCdoDog({ dateOfBirth: new Date() })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification,
        neuteringConfirmation,
        microchipDeadline,
        dogNotFitForMicrochip: true,
        dogNotNeutered: true
      }, devUser)

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'verificationDateRecorded',
        value: {
          microchipVerification: null,
          neuteringConfirmation: null,
          verificationDatesRecorded: expect.any(Date),
          neuteringDeadline: expect.any(Date),
          microchipDeadline: expect.any(Date)
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null,
          neutering_deadline: null,
          microchip_deadline: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification,
          neutering_deadline: expect.any(Date),
          microchip_deadline: expect.any(Date)
        }, devUser)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification: new Date(),
        neuteringConfirmation: new Date()
      }, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('issueCertificate', () => {
    test('should issue certificate', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toBe(sentDate)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'certificateIssued',
        value: sentDate,
        callback: undefined
      }])

      await cdoTaskList.getUpdates().dog[0].callback()

      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          certificate_issued: undefined
        },
        {
          index_number: 'ED300097',
          certificate_issued: sentDate
        },
        devUser)
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: 'Pre-exempt'
        },
        {
          index_number: 'ED300097',
          status: 'Exempt'
        },
        devUser)
    })

    test('should issue certificate given only microchip and neutering deadlines set', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          exemptionOrder: '2015',
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: undefined,
          microchipVerification: undefined,
          neuteringDeadline: new Date('9999-10-01'),
          microchipDeadline: new Date('9999-10-01'),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt',
          dateOfBirth: new Date()
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toBe(sentDate)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'certificateIssued',
        value: sentDate,
        callback: undefined
      }])

      await cdoTaskList.getUpdates().dog[0].callback()

      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          certificate_issued: undefined
        },
        {
          index_number: 'ED300097',
          certificate_issued: sentDate
        },
        devUser)
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: 'Pre-exempt'
        },
        {
          index_number: 'ED300097',
          status: 'Exempt'
        },
        devUser)
    })
  })

  describe('submitFormTwo', () => {
    test('should submit form two', async () => {
      mockCdoRepository.submitFormTwo.mockImplementation(async (_indexNumber, _cdoTaskList, _payload, _username, sendEmailCallback) => {
        await sendEmailCallback()
      })
      const indexNumber = 'ED300100'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          exemptionOrder: '2015',
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: undefined,
          microchipVerification: undefined,
          neuteringDeadline: new Date('9999-10-01'),
          microchipDeadline: new Date('9999-10-01'),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          indexNumber,
          id: 300100,
          microchipNumber: '123456789012345',
          status: 'Pre-exempt',
          dateOfBirth: new Date(),
          name: 'Pip'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      const payload = {
        microchipNumber: '223456789012345',
        microchipVerification: '03/12/2024',
        neuteringConfirmation: '04/12/2024',
        microchipDeadline: '',
        dogNotNeutered: false,
        dogNotFitForMicrochip: false
      }
      const middleEarthUser = {
        username: 'bilbo.baggins@shire.police.me',
        displayname: 'Bilbo Baggins'
      }

      await cdoService.submitFormTwo(indexNumber, payload, middleEarthUser)

      expect(mockCdoRepository.submitFormTwo).toHaveBeenCalledWith('ED300100', cdoTaskList, payload, expect.objectContaining({ username: 'bilbo.baggins@shire.police.me' }), expect.any(Function))
      expect(sendForm2Emails).toHaveBeenCalledWith('ED300100', 'Pip', '223456789012345', false, '03/12/2024', '04/12/2024', false, 'bilbo.baggins@shire.police.me')
    })
  })

  describe('_sendForm2EmailsFromTaskList', () => {
    const middleEarthUser = {
      username: 'bilbo.baggins@shire.police.me',
      displayname: 'Bilbo Baggins'
    }
    const cdoTaskList = buildCdoTaskList({
      dog: buildCdoDog({
        indexNumber: 'ED300100',
        microchipNumber: '223456789012345',
        name: 'Pip'
      })
    })

    test('should get fields and call sendForm2Emails', async () => {
      const payload = {
        microchipVerification: '03/12/2024',
        neuteringConfirmation: '04/12/2024',
        microchipDeadline: '',
        dogNotNeutered: false,
        dogNotFitForMicrochip: false
      }
      await cdoService._sendForm2EmailsFromTaskList('ED300100', cdoTaskList, payload, middleEarthUser)
      expect(sendForm2Emails).toHaveBeenCalledWith('ED300100', 'Pip', '223456789012345', false, '03/12/2024', '04/12/2024', false, 'bilbo.baggins@shire.police.me')
    })

    test('should get fields and call sendForm2Emails given dog not neutered and dog not fit for microchip', async () => {
      const payload = {
        microchipVerification: '',
        neuteringConfirmation: '',
        microchipDeadline: '03/12/2024',
        dogNotNeutered: true,
        dogNotFitForMicrochip: true
      }
      await cdoService._sendForm2EmailsFromTaskList('ED300100', cdoTaskList, payload, middleEarthUser)
      expect(sendForm2Emails).toHaveBeenCalledWith('ED300100', 'Pip', '223456789012345', true, '03/12/2024', '', true, 'bilbo.baggins@shire.police.me')
    })
  })
})
