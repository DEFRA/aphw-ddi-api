/**
 * @typedef CdoService.GetTaskList
 * @param {string} cdoId
 * @return {Promise<CdoTaskList>}
 */

const { sendActivityToAudit, sendUpdateToAudit } = require('../messaging/send-audit')
const { getActivityByLabel } = require('../repos/activity')
const { activities } = require('../constants/event/events')
const { stripTime } = require('../dto/dto-helper')
const { EXEMPTION, DOG } = require('../constants/event/audit-event-object-types')
const { microchipExists } = require('../repos/microchip')

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
    const activityType = await getActivityByLabel(activities.applicationPackSent)

    const sendEvent = async () => {
      await sendActivityToAudit({
        activity: activityType.id,
        activityType: 'sent',
        pk: cdoId,
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: activities.applicationPackSent
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
   * @param {string} cdoIndexNumber
   * @param {InsuranceDetails} insuranceDetails
   * @param user
   * @return {Promise<import('../data/domain').CdoTaskList>}
   */
  async recordInsuranceDetails (cdoIndexNumber, insuranceDetails, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)

    const preChanged = {
      index_number: cdoIndexNumber,
      insurance_company: cdoTaskList.cdoSummary.insuranceCompany ?? null,
      insurance_renewal_date: stripTime(cdoTaskList.cdoSummary.insuranceRenewal) ?? null
    }

    const postChanged = {
      index_number: cdoIndexNumber,
      insurance_company: insuranceDetails.insuranceCompany ?? null,
      insurance_renewal_date: stripTime(insuranceDetails.insuranceRenewal) ?? null
    }

    const sendEvent = async () => {
      await sendUpdateToAudit(EXEMPTION, preChanged, postChanged, user)
    }

    cdoTaskList.recordInsuranceDetails(insuranceDetails.insuranceCompany, insuranceDetails.insuranceRenewal, sendEvent)

    return this.cdoRepository.saveCdoTaskList(cdoTaskList)
  }

  /**
   * @param {string} cdoIndexNumber
   * @param {{microchipNumber: string}} microchip
   * @param user
   * @return {Promise<import('../data/domain').CdoTaskList>}
   */
  async recordMicrochipNumber (cdoIndexNumber, microchip, user) {
    const microchipNumber = microchip.microchipNumber

    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)
    const preMicrochipNumber = cdoTaskList.cdoSummary.microchipNumber

    const callback = async () => {
      const preAudit = {
        index_number: cdoIndexNumber,
        microchip1: preMicrochipNumber ?? null
      }
      const postAudit = {
        index_number: cdoIndexNumber,
        microchip1: microchipNumber
      }
      await sendUpdateToAudit(DOG, preAudit, postAudit, user)
    }

    const duplicateMicrochip = await microchipExists(cdoTaskList.cdoSummary.id, microchipNumber)

    cdoTaskList.recordMicrochipNumber(microchipNumber, duplicateMicrochip, callback)

    return this.cdoRepository.saveCdoTaskList(cdoTaskList)
  }

  /**
   * @param {string} cdoIndexNumber
   * @param {{ applicationFeePaid: Date }} applicationFeeObject
   * @param user
   * @return {Promise<import('../data/domain/cdoTaskList').CdoTaskList>}
   */
  async recordApplicationFee (cdoIndexNumber, applicationFeeObject, user) {
    const applicationFeePaid = applicationFeeObject.applicationFeePaid
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)
    const preApplicationFeePaid = cdoTaskList.cdoSummary.applicationFeePaid

    const callback = async () => {
      const preAudit = {
        index_number: cdoIndexNumber,
        application_fee_paid: preApplicationFeePaid ?? null
      }
      const postAudit = {
        index_number: cdoIndexNumber,
        application_fee_paid: applicationFeePaid
      }
      await sendUpdateToAudit(EXEMPTION, preAudit, postAudit, user)
    }

    cdoTaskList.recordApplicationFee(applicationFeePaid, callback)

    return this.cdoRepository.saveCdoTaskList(cdoTaskList)
  }

  async sendForm2 (cdoIndexNumber, sentDate, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)
    const activityType = await getActivityByLabel(activities.applicationPackSent)

    const callback = async () => {
      await sendActivityToAudit({
        activity: activityType.id,
        activityType: 'sent',
        pk: cdoIndexNumber,
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: activities.form2Sent
      }, user)
    }

    cdoTaskList.sendForm2(sentDate, callback)

    return this.cdoRepository.saveCdoTaskList(cdoTaskList)
  }
}

module.exports = { CdoService }
