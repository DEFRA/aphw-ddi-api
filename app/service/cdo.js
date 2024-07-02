/**
 * @typedef CdoService.GetTaskList
 * @param {string} cdoId
 * @return {Promise<CdoTaskList>}
 */

const { sendActivityToAudit } = require('../messaging/send-audit')
const { getActivityByLabel } = require('../repos/activity')
const { activities } = require('../constants/event/events')

/**
 * @param {CdoRepository} cdoRepository
 * @constructor
 * @property {CdoService.GetTaskList} getTaskList
 */
class CdoService {
  constructor (cdoRepository) {
    this.cdoRepository = cdoRepository
  }

  /**
   * @type {CdoService.GetTaskList}
   */
  async getTaskList (cdoId) {
    return this.cdoRepository.getCdoTaskList(cdoId)
  }

  async sendApplicationPack (cdoId, sentDate, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoId)
    const activityType = await getActivityByLabel(activities.applicationPack)

    const sendEvent = async () => {
      await sendActivityToAudit({
        activity: activityType.id,
        activityType: 'sent',
        pk: cdoId,
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: activities.applicationPack
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
}

module.exports = { CdoService }
