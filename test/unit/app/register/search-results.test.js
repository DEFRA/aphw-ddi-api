const { mapResults } = require('../../../../app/register/search/search-results')

describe('SearchResults', () => {
  test('should map results when a dog search', () => {
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
    const results = mapResults(searchResults, 'dog', 'bruno')
    expect(results).toEqual([{ distance: 1, dogId: 123, dogName: 'Bruno', personId: 456, rank: 9 }])
  })

  test('should map results when a dog search and dog name is null', () => {
    const searchResults = [
      {
        dog_id: 123,
        person_id: 456,
        json: {
          dogName: null
        },
        rank: 9
      }
    ]
    const results = mapResults(searchResults, 'dog', 'something')
    expect(results).toEqual([{ distance: 9, dogId: 123, dogName: null, personId: 456, rank: 9 }])
  })

  test('should map results when an owner search', () => {
    const searchResults = [
      {
        dog_id: 123,
        person_id: 456,
        json: {
          firstName: 'John',
          lastName: 'Smith',
          dogName: 'Bruno'
        },
        rank: 9
      }
    ]
    const results = mapResults(searchResults, 'owner', 'smith')
    expect(results).toEqual([{ distance: 6, dogId: 123, dogName: 'Bruno', firstName: 'John', lastName: 'Smith', personId: 456, rank: 9 }])
  })
})
