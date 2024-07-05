const { buildCdo, buildExemption } = require('../../../mocks/cdo/domain')
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

  beforeEach(function () {
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
      saveCdoTaskList: jest.fn()
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

  describe('recordInsuranceDetails', () => {
    test('should record insurance details', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
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
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'insurance',
        value: {
          company: 'Dog\'s Trust',
          renewalDate: inTheFuture
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
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
      sendUpdateToAudit.mockClear()
    })
  })

  describe('recordMicrochipNumber', () => {
    test('should record microchip number', async () => {
      microchipExists.mockResolvedValue(null)

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
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
      sendUpdateToAudit.mockClear()
    })
  })

  describe('recordApplicationFee', () => {
    test('should record application fee', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
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
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationFeePaid',
        value: applicationFeePaid,
        callback: expect.any(Function)
      }])

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      await cdoTaskList.getUpdates().exemption[0].callback()
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
      sendUpdateToAudit.mockClear()
    })
  })

  describe('sendForm2', () => {
    test('should send Form 2', async () => {
      getActivityByLabel.mockResolvedValue({ id: 10, label: 'Form 2' })
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({ applicationPackSent: new Date() })
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
      sendActivityToAudit.mockClear()
    })

    test('should not send Form 2 a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03'),
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
          applicationPackSent: new Date()
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
        exemption: buildExemption({ applicationPackSent: new Date(), form2Sent: new Date() })
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
          neuteringConfirmation
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification
        }, devUser)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
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
})
