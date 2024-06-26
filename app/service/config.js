/**
 * @type {CdoService}
 */
let cdoService

const getCdoService = () => {
  if (cdoService === undefined) {
    const cdoRepository = require('../repos/cdo')
    const { CdoService } = require('./cdo')

    cdoService = new CdoService(cdoRepository)
  }
  return cdoService
}

module.exports = {
  getCdoService
}
