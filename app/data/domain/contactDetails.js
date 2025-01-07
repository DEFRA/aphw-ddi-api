class ContactDetails {
  /**
   * @param {string} email
   * @param {Address} address
   */
  constructor (email, address = {}) {
    this.email = email
    this.addressLine1 = address.addressLine1
    this.addressLine2 = address.addressLine2
    this.town = address.town
    this.postcode = address.postcode
  }
}

module.exports = ContactDetails
