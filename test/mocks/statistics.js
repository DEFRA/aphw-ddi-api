const countsPerStatus = [
  { status_id: 4, total: '20', status: { id: 4, status: 'Interim exempt', status_type: 'STANDARD' } },
  { status_id: 5, total: '30', status: { id: 5, status: 'Pre-exempt', status_type: 'STANDARD' } },
  { status_id: 6, total: '40', status: { id: 6, status: 'Failed', status_type: 'STANDARD' } },
  { status_id: 7, total: '500', status: { id: 7, status: 'Exempt', status_type: 'STANDARD' } },
  { status_id: 8, total: '60', status: { id: 8, status: 'In breach', status_type: 'STANDARD' } },
  { status_id: 9, total: '70', status: { id: 9, status: 'Withdrawn', status_type: 'STANDARD' } },
  { status_id: 10, total: '80', status: { id: 10, status: 'Inactive', status_type: 'STANDARD' } }
]

module.exports = {
  countsPerStatus
}
