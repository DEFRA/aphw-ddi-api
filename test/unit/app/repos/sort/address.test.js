const { addressSort, getLatestAddress } = require('../../../../../app/repos/sort/address')

describe('address', () => {
  const addressList = [
    {
      id: 15,
      person_id: 14,
      address_id: 15,
      created_at: '2024-05-23T19:06:29.830Z',
      deleted_at: null,
      updated_at: '2024-05-23T19:06:29.840Z',
      address: {
        id: 15,
        address_line_1: '95883 Abshire Radial',
        address_line_2: null,
        town: 'Tyler',
        postcode: 'S1 1AA',
        county: null,
        country_id: 1,
        created_at: '2024-05-23T19:06:29.830Z',
        deleted_at: null,
        updated_at: '2024-05-23T19:06:29.837Z',
        country: { id: 1, country: 'England' }
      }
    },
    {
      id: 21,
      person_id: 14,
      address_id: 21,
      created_at: '2024-05-24T08:28:35.144Z',
      deleted_at: null,
      updated_at: '2024-05-24T08:28:35.193Z',
      address: {
        id: 21,
        address_line_1: 'FLAT 102, MARLYN LODGE, PORTSOKEN STREET',
        address_line_2: null,
        town: 'LONDON',
        postcode: 'E1 8RB',
        county: null,
        country_id: 1,
        created_at: '2024-05-24T08:28:35.144Z',
        deleted_at: null,
        updated_at: '2024-05-24T08:28:35.187Z',
        country: { id: 1, country: 'England' }
      }
    }
  ]

  describe('addressSort', () => {
    test('should sort addresses DESC by address id', () => {
      const addresses = [
        ...addressList
      ]
      addresses.sort(addressSort)
      expect(addresses[0].id).toBe(21)
    })
  })

  describe('getLatestAddress', () => {
    test('should getLatestAddress', () => {
      const addresses = [
        ...addressList
      ]
      const latestAddress = getLatestAddress(addresses)
      expect(latestAddress).toEqual([{
        id: 21,
        person_id: 14,
        address_id: 21,
        created_at: '2024-05-24T08:28:35.144Z',
        deleted_at: null,
        updated_at: '2024-05-24T08:28:35.193Z',
        address: {
          id: 21,
          address_line_1: 'FLAT 102, MARLYN LODGE, PORTSOKEN STREET',
          address_line_2: null,
          town: 'LONDON',
          postcode: 'E1 8RB',
          county: null,
          country_id: 1,
          created_at: '2024-05-24T08:28:35.144Z',
          deleted_at: null,
          updated_at: '2024-05-24T08:28:35.187Z',
          country: { id: 1, country: 'England' }
        }
      }])
    })

    test('should getLatestAddress if none exist', () => {
      const addresses = undefined
      const latestAddress = getLatestAddress(addresses)
      expect(latestAddress).toEqual([])
    })
  })
})
