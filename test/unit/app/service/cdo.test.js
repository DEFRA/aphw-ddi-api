const CdoService = require('../../../../app/service/cdo')
const { buildCdo } = require('../../../mocks/cdo/domain')
const { CdoTaskList } = require('../../../../app/data/domain')

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
      createCdo: jest.fn()
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
})
