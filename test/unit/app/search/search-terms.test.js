const { addJoinedPostcode } = require('../../../../app/search/search-processors/search-terms')

describe('Search terms', () => {
  describe('addJoinedPostcode', () => {
    test('should join postcode elements when terms contain postcode format', () => {
      const terms = ['Something1', 'TS1', '2AB', 'Something2']
      const res = addJoinedPostcode(terms)
      expect(res.length).toBe(5)
      expect(res).toEqual(['TS12AB', 'Something1', 'TS1', '2AB', 'Something2'])
    })

    test('should join postcode elements when terms contain postcode format mixed case', () => {
      const terms = ['Something1', 'ab12', '2dF', 'Something2']
      const res = addJoinedPostcode(terms)
      expect(res.length).toBe(5)
      expect(res).toEqual(['ab122dF', 'Something1', 'ab12', '2dF', 'Something2'])
    })

    test('should ignore extra terms when they dont contain postcode format', () => {
      const terms = ['Something1', 'Jon', 'pat', 'Something2']
      const res = addJoinedPostcode(terms)
      expect(res.length).toBe(4)
      expect(res).toEqual(['Something1', 'Jon', 'pat', 'Something2'])
    })
  })
})
