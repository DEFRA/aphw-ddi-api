const { countsPerStatusDto } = require('../../../../app/dto/statistics')
const { deepClone } = require('../../../../app/lib/deep-clone')
const { countsPerStatus: mockCountsPerStatus } = require('../../../mocks/statistics')

describe('statistics Dto', () => {
  test('should map countsPerStatus to countsPerStatusDto', () => {
    const dto = countsPerStatusDto(mockCountsPerStatus)

    const expectedDto = [
      { status: { id: 4, status: 'Interim exempt' }, total: 20 },
      { status: { id: 5, status: 'Pre-exempt' }, total: 30 },
      { status: { id: 6, status: 'Failed' }, total: 40 },
      { status: { id: 7, status: 'Exempt' }, total: 500 },
      { status: { id: 8, status: 'In breach' }, total: 60 },
      { status: { id: 9, status: 'Withdrawn' }, total: 70 },
      { status: { id: 10, status: 'Inactive' }, total: 80 }
    ]

    expect(dto).toEqual(expectedDto)
  })

  test('should map countsPerStatus to countsPerStatusDto handling missing totals', () => {
    const mockMissingCounts = deepClone(mockCountsPerStatus)
    mockMissingCounts[0].total = null
    mockMissingCounts[2].total = undefined

    const dto = countsPerStatusDto(mockMissingCounts)

    const expectedDto = [
      { status: { id: 4, status: 'Interim exempt' }, total: 0 },
      { status: { id: 5, status: 'Pre-exempt' }, total: 30 },
      { status: { id: 6, status: 'Failed' }, total: 0 },
      { status: { id: 7, status: 'Exempt' }, total: 500 },
      { status: { id: 8, status: 'In breach' }, total: 60 },
      { status: { id: 9, status: 'Withdrawn' }, total: 70 },
      { status: { id: 10, status: 'Inactive' }, total: 80 }
    ]

    expect(dto).toEqual(expectedDto)
  })
})
