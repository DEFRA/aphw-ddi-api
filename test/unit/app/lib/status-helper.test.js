const { getInactiveSubStatus } = require('../../../../app/lib/status-helper')

describe('StatusHelper test', () => {
  test('getInactiveSubStatus should handle non-Inactive statuses', () => {
    expect(getInactiveSubStatus({ status: { status: 'Exempt' } })).toBe(null)
  })

  test('getInactiveSubStatus should handle non-Inactive statuses - scenario 2', () => {
    expect(getInactiveSubStatus({ status: { status: 'In breach' } })).toBe(null)
  })

  test('getInactiveSubStatus should handle Inactive - dead', () => {
    expect(getInactiveSubStatus({ status: { status: 'Inactive' }, death_date: '2024-05-15' })).toBe('dead')
  })

  test('getInactiveSubStatus should handle Inactive - exported', () => {
    expect(getInactiveSubStatus({ status: { status: 'Inactive' }, exported_date: '2024-05-15' })).toBe('exported')
  })

  test('getInactiveSubStatus should handle Inactive - stolen', () => {
    expect(getInactiveSubStatus({ status: { status: 'Inactive' }, stolen_date: '2024-05-15' })).toBe('stolen')
  })

  test('getInactiveSubStatus should handle Inactive - untraceable', () => {
    expect(getInactiveSubStatus({ status: { status: 'Inactive' }, untraceable_date: '2024-05-15' })).toBe('untraceable')
  })

  test('getInactiveSubStatus should handle Inactive when no sub status', () => {
    expect(getInactiveSubStatus({ status: { status: 'Inactive' } })).toBe(null)
  })
})
