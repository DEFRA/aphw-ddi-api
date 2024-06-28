const { CdoService } = require('../../../../app/service/cdo')
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
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.sendApplicationPack(cdoIndexNumber, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: expect.any(Date),
        callback: expect.any(Function)
      }])
      // do event call
    })

    test('should not send application pack a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03')
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.sendApplicationPack(cdoIndexNumber, devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.sendApplicationPack(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })
})
