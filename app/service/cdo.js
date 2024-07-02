/**
 * @typedef CdoService.GetTaskList
 * @param {string} cdoId
 * @return {Promise<CdoTaskList>}
 */

const { sendActivityToAudit } = require('../messaging/send-audit')
const { getActivityByLabel } = require('../repos/activity')

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

CdoService.prototype.sendApplicationPack = async function (cdoId, sentDate, user) {
  const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoId)
  const activityType = await getActivityByLabel('Application pack')

  const sendEvent = async () => {
    await sendActivityToAudit({
      activity: activityType.id,
      activityType: 'sent',
      pk: cdoId,
      source: 'dog',
      activityDate: sentDate,
      targetPk: 'dog',
      activityLabel: 'Application pack'
    }, user)
  }

  try {
    await cdoTaskList.sendApplicationPack(sentDate, sendEvent)
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
