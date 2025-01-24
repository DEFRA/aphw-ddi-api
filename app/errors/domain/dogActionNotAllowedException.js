class DogActionNotAllowedException extends Error {
  constructor (message) {
    super(message)
    this.name = 'DogActionNotAllowedException'
  }
}

module.exports = {
  DogActionNotAllowedException
}
