const { buildAddressString, buildAddressStringAlternate, shuffleAddress } = require('../../../../app/lib/address-helper')

describe('AddressHelper test', () => {
  describe('buildAddressString test', () => {
    test('should build address', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })).toEqual('addr1, addr2, town, postcode')
    })
    test('should build short address', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: null,
        town: null,
        postcode: 'postcode'
      })).toEqual('addr1, postcode')
    })
    test('should build address and add alternate postcode', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'post code'
      }, true)).toEqual('addr1, addr2, town, post code, postcode')
    })
  })

  describe('buildAddressStringAlternate test', () => {
    test('should build address', () => {
      expect(buildAddressStringAlternate({
        addressLine1: 'addr1',
        addressLine2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })).toEqual('addr1, addr2, town, postcode')
    })
    test('should build short address', () => {
      expect(buildAddressStringAlternate({
        addressLine1: 'addr1',
        addressLine2: null,
        town: null,
        postcode: 'postcode'
      })).toEqual('addr1, postcode')
    })
  })

  describe('shuffleAddress test', () => {
    test('should build address with all parts', () => {
      expect(shuffleAddress({
        addressLine1: 'addr1',
        addressLine2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })).toEqual({
        addressLine1: 'addr1',
        addressLine2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })
    })
    test('should build address when missing 1 line', () => {
      expect(shuffleAddress({
        addressLine1: 'addr1',
        addressLine2: '',
        town: 'town',
        postcode: 'postcode'
      })).toEqual({
        addressLine1: 'addr1',
        addressLine2: 'town',
        town: 'postcode',
        postcode: ''
      })
    })
    test('should build address when missing 2 lines', () => {
      expect(shuffleAddress({
        addressLine1: 'addr1',
        addressLine2: '',
        town: '',
        postcode: 'postcode'
      })).toEqual({
        addressLine1: 'addr1',
        addressLine2: 'postcode',
        town: '',
        postcode: ''
      })
    })
  })
})
