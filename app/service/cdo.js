/**
 * @typedef CdoService.GetTaskList
 * @param {string} cdoId
 * @return {Promise<CdoTaskList>}
 */

/**
 * @param {CdoRepository} cdoRepository
 * @constructor
 * @property {CdoService.GetTaskList} getTaskList
 */
function CdoService (cdoRepository) {
  this.cdoRepository = cdoRepository
}

/**
 * @type {CdoService.GetTaskList}
 */
CdoService.prototype.getTaskList = async function (cdoId) {
  return this.cdoRepository.getCdoTaskList(cdoId)
}

CdoService.prototype.sendApplicationPack = async function (cdoId, user) {
  const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoId)
  const sendEvent = () => {}

  try {
    await cdoTaskList.sendApplicationPack(sendEvent)
  } catch (e) {
    console.error('Error in CdoService.sendApplicationPack while updating domain model')
    throw e
  }

  try {
    await this.cdoRepository.saveCdoTaskList(cdoTaskList)
  } catch (e) {
    console.error('Error in CdoService.sendApplicationPack whilst updating the aggregrate')
    throw e
  }
}

module.exports = { CdoService }
