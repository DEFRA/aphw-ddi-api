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
  const taskList = await this.cdoRepository.getCdoTaskList(cdoId)

  console.log('~~~~~~ Chris Debug ~~~~~~ ', 'taskList', taskList)
  return taskList
}

module.exports = { CdoService }
