/**
 * @type {CdoService}
 */
let cdoService

/**
 * @type {DogService}
 */
let dogService

/**
 * @type {RegistrationService}
 */
let registrationService

const getCdoService = () => {
  if (cdoService === undefined) {
    const cdoRepository = require('../repos/cdo')
    const { CdoService } = require('./cdo')

    cdoService = new CdoService(cdoRepository)
  }
  return cdoService
}

const getDogService = () => {
  if (dogService === undefined) {
    const dogRepository = require('../repos/dogs')
    const breachesRepository = require('../repos/breaches')
    const { DogService } = require('./dog')

    dogService = new DogService(dogRepository, breachesRepository)
  }
  return dogService
}

const getRegistrationService = () => {
  if (registrationService === undefined) {
    const userRepository = require('../repos/user-accounts')
    const { RegistrationService } = require('./registration')

    registrationService = new RegistrationService(userRepository)
  }
  return registrationService
}

module.exports = {
  getCdoService,
  getDogService,
  getRegistrationService
}
