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
      expect(result).toEqual({
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: inTheFuture
      })
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
    })
  })
})
