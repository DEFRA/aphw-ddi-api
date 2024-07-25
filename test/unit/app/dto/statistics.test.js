const { countsPerStatusDto, countsPerCountryDto } = require('../../../../app/dto/statistics')
const { deepClone } = require('../../../../app/lib/deep-clone')
const { countsPerStatus: mockCountsPerStatus, countsPerCountry: mockCountsPerCountry } = require('../../../mocks/statistics')
const { breeds: mockBreeds } = require('../../../mocks/dog-breeds')

describe('statistics Dto', () => {
  describe('countsPerStatusDto', () => {
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

  describe('countsPerCountryDto', () => {
    test('should map countsPerCountry to countsPerStatusDto including zero counts', () => {
      const data = { counts: mockCountsPerCountry, breeds: mockBreeds }
      const dto = countsPerCountryDto(data)

      const expectedDto = [
        { total: 55, breed: 'Breed 1', country: 'England' },
        { total: 2, breed: 'Breed 1', country: 'Wales' },
        { total: 30, breed: 'Breed 1', country: 'Scotland' },
        { total: 257, breed: 'Breed 2', country: 'England' },
        { total: 0, breed: 'Breed 2', country: 'Wales' },
        { total: 10, breed: 'Breed 2', country: 'Scotland' },
        { total: 0, breed: 'Breed 3', country: 'England' },
        { total: 128, breed: 'Breed 3', country: 'Wales' },
        { total: 0, breed: 'Breed 3', country: 'Scotland' }
      ]

      expect(dto).toEqual(expectedDto)
    })

    test('should handle no data', () => {
      const dto = countsPerCountryDto(null)

      const expectedDto = []

      expect(dto).toEqual(expectedDto)
    })
  })
})
