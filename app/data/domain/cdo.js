/**
 * @param {Person} person
 * @param {Dog} dog
 * @param {Exemption} exemption
 * @constructor
 * @property {Person} person
 * @property {Dog} dog
 * @property {Exemption} exemption
 */
function Cdo (person, dog, exemption) {
  this.person = person
  this.dog = dog
  this.exemption = exemption
}

module.exports = Cdo
