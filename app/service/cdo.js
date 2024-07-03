/**
 * @typedef CdoService.GetTaskList
 * @param {string} cdoId
 * @return {Promise<CdoTaskList>}
 */

const { sendActivityToAudit, sendUpdateToAudit } = require('../messaging/send-audit')
const { getActivityByLabel } = require('../repos/activity')
const { activities } = require('../constants/event/events')
const { stripTime } = require('../dto/dto-helper')
const { EXEMPTION } = require('../constants/event/audit-event-object-types')

/**
 * @param {CdoRepository} cdoRepository
 * @constructor
 * @property {CdoService.GetTaskList} getTaskList
 */
class CdoService {
  /**
   * @param {CdoRepository} cdoRepository
   */
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

  /**
   * @typedef InsuranceDetails
   * @property {string} insuranceCompany
   * @property {Date|null} insuranceRenewal
   */
  /**
   * @param {string} cdoId
   * @param {InsuranceDetails} insuranceDetails
   * @param user
   * @return {Promise<InsuranceDetails>}
   */
  async recordInsuranceDetails (cdoId, insuranceDetails, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoId)

    const preChanged = {
      index_number: cdoId,
      insurance_company: cdoTaskList.cdoSummary.insuranceCompany ?? null,
      insurance_renewal_date: stripTime(cdoTaskList.cdoSummary.insuranceRenewal) ?? null
    }

    const postChanged = {
      index_number: cdoId,
      insurance_company: insuranceDetails.insuranceCompany ?? null,
      insurance_renewal_date: stripTime(insuranceDetails.insuranceRenewal) ?? null
    }

    const sendEvent = async () => {
      await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)
    }

    cdoTaskList.addInsuranceDetails(insuranceDetails.insuranceCompany, insuranceDetails.insuranceRenewal, sendEvent)

    const returnedCdoTaskList = await this.cdoRepository.saveCdoTaskList(cdoTaskList)

    const { insuranceCompany, insuranceRenewal } = returnedCdoTaskList.cdoSummary

    return { insuranceCompany, insuranceRenewal }
  }
}

module.exports = { CdoService }
