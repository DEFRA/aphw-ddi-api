const { mapResults } = require('../../../../app/register/search/search-results')

describe('SearchResults', () => {
  test('should map results', () => {
    const searchResults = [
      {
        dog_id: 123,
        person_id: 456,
        json: {
          dogName: 'Bruno'
        },
        rank: 9
      }
    ]
    const results = mapResults(searchResults, 'dog')
    expect(results).toEqual([{ dogId: 123, dogName: 'Bruno', personId: 456, rank: 9, searchType: 'dog' }])
  })
})
