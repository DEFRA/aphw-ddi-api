const countsPerStatus = [
  { status_id: 4, total: '20', status: 'Interim exempt', dogs: { status_id: 4 } },
  { status_id: 5, total: '30', status: 'Pre-exempt', dogs: { status_id: 5 } },
  { status_id: 6, total: '40', status: 'Failed', dogs: { status_id: 6 } },
  { status_id: 7, total: '500', status: 'Exempt', dogs: { status_id: 7 } },
  { status_id: 8, total: '60', status: 'In breach', dogs: { status_id: 8 } },
  { status_id: 9, total: '70', status: 'Withdrawn', dogs: { status_id: 9 } },
  { status_id: 10, total: '80', status: 'Inactive', dogs: { status_id: 10 } }
]

const countsPerCountry = [
  { breed: 'Breed 1', country: 'England', total: '55' },
  { breed: 'Breed 1', country: 'Wales', total: '2' },
  { breed: 'Breed 1', country: 'Scotland', total: '30' },
  { breed: 'Breed 2', country: 'England', total: '257' },
  { breed: 'Breed 2', country: 'Scotland', total: '10' },
  { breed: 'Breed 3', country: 'Wales', total: '128' }
]

module.exports = {
  countsPerStatus,
  countsPerCountry
}
