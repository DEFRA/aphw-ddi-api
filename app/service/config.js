/**
 * @type {CdoService}
 */
let cdoService

/**
 * @type {DogService}
 */
let dogService

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

module.exports = {
  getCdoService,
  getDogService
}
