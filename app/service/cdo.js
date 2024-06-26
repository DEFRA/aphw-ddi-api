
/**
 * @param {CdoRepository} cdoRepository
 * @constructor
 */
function CdoService (cdoRepository) {
  this.cdoRepository = cdoRepository
}

CdoService.prototype.getTaskList = async function (cdoId) {
  return this.cdoRepository.getCdoTaskList(cdoId)
}

module.exports = CdoService
