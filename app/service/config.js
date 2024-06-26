
class ServiceProvider {
  /**
   * @type {CdoService}
   */
  static cdoService

  /**
   * @return {CdoService}
   */
  static getCdoService () {
    if (ServiceProvider.cdoService === undefined) {
      const cdoRepository = require('../repos/cdo')
      const CdoService = require('./cdo')

      ServiceProvider.cdoService = new CdoService(cdoRepository)
    }
    return ServiceProvider.cdoService
  }
}

module.exports = { ServiceProvider }
