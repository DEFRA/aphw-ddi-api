class Address {
  constructor ({
    addressLine1,
    addressLine2,
    town,
    postcode
  }) {
    this.addressLine1 = addressLine1
    this.addressLine2 = addressLine2
    this.town = town
    this.postcode = postcode
  }
}

module.exports = Address
