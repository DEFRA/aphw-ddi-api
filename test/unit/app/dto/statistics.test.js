const { countsPerStatusDto } = require('../../../../app/dto/statistics')
const { deepClone } = require('../../../../app/lib/deep-clone')
const { countsPerStatus: mockCountsPerStatus } = require('../../../mocks/statistics')

describe('statistics Dto', () => {
  test('should map countsPerStatus to countsPerStatusDto', () => {
    const dto = countsPerStatusDto(mockCountsPerStatus)

    const expectedDto = [
      { status: { id: 4, name: 'Interim exempt' }, total: 20 },
      { status: { id: 5, name: 'Pre-exempt' }, total: 30 },
      { status: { id: 6, name: 'Failed' }, total: 40 },
      { status: { id: 7, name: 'Exempt' }, total: 500 },
      { status: { id: 8, name: 'In breach' }, total: 60 },
      { status: { id: 9, name: 'Withdrawn' }, total: 70 },
      { status: { id: 10, name: 'Inactive' }, total: 80 }
    ]

    expect(dto).toEqual(expectedDto)
  })

  test('should map countsPerStatus to countsPerStatusDto handling missing totals', () => {
    const mockMissingCounts = deepClone(mockCountsPerStatus)
    mockMissingCounts[0].total = null
    mockMissingCounts[2].total = undefined

    const dto = countsPerStatusDto(mockMissingCounts)

    const expectedDto = [
      { status: { id: 4, name: 'Interim exempt' }, total: 0 },
      { status: { id: 5, name: 'Pre-exempt' }, total: 30 },
      { status: { id: 6, name: 'Failed' }, total: 0 },
      { status: { id: 7, name: 'Exempt' }, total: 500 },
      { status: { id: 8, name: 'In breach' }, total: 60 },
      { status: { id: 9, name: 'Withdrawn' }, total: 70 },
      { status: { id: 10, name: 'Inactive' }, total: 80 }
    ]

    expect(dto).toEqual(expectedDto)
  })

  test('should handle no data', () => {
    const dto = countsPerStatusDto(null)

    const expectedDto = []

    expect(dto).toEqual(expectedDto)
  })
})
