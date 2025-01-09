const { ContactDetails, Address } = require('../../../../../app/data/domain')

describe('contact-details', () => {
  test('should instantiate with only an email', () => {
    const email = 'someone@domain.co.uk'
    const contactDetails = new ContactDetails(email)
    expect(contactDetails.email).toBe(email)
    expect(contactDetails.addressLine1).toBeUndefined()
    expect(contactDetails.addressLine2).toBeUndefined()
    expect(contactDetails.town).toBeUndefined()
    expect(contactDetails.postcode).toBeUndefined()
  })

  test('should instantiate with an address and no email', () => {
    const address = new Address({
      addressLine1: '1 Anywhere Str',
      addressLine2: null,
      postcode: 'A23 A11',
      town: 'Anywhereville'
    })
    const contactDetails = new ContactDetails(undefined, address)
    expect(contactDetails.email).toBeUndefined()
    expect(contactDetails.addressLine1).toBe('1 Anywhere Str')
    expect(contactDetails.addressLine2).toBeNull()
    expect(contactDetails.town).toBe('Anywhereville')
    expect(contactDetails.postcode).toBe('A23 A11')
  })
})
