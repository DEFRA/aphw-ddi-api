const { buildAddressString, buildAddressStringAlternate } = require('../../../../app/lib/address-helper')

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
})
