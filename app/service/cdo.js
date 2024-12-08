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
const { sendForm2Emails } = require('../lib/email-helper')

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

  async processApplicationPack (cdoId, processedDate, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoId)
    const activityType = await getActivityByLabel(activities.applicationPackSent)

    const processEvent = async () => {
      await sendActivityToAudit({
        activity: activityType.id,
        activityType: 'processed',
        pk: cdoId,
        source: 'dog',
        activityDate: processedDate,
        targetPk: 'dog',
        activityLabel: activities.applicationPackProcessed
      }, user)
    }

    try {
      await cdoTaskList.processApplicationPack(processedDate, processEvent)
    } catch (e) {
      console.error('Error in CdoService.processApplicationPack while updating domain model')
      throw e
    }

    try {
      await this.cdoRepository.saveCdoTaskList(cdoTaskList)
    } catch (e) {
      console.error('Error in CdoService.processApplicationPack whilst updating the aggregrate')
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
      insurance_company: insuranceDetails.insuranceCompany,
      insurance_renewal_date: stripTime(insuranceDetails.insuranceRenewal)
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

  /**
   * @param cdoIndexNumber
   * @param {{
   *   neuteringConfirmation?: Date|undefined;
   *   microchipVerification?: Date|undefined;
   *   microchipDeadline?: Date|undefined;
   *   dogNotNeutered?: true|undefined;
   *   dogNotFitForMicrochip?: true|undefined;
   * }} verificationDates
   * @param user
   * @return {Promise<import('../data/domain/cdoTaskList').CdoTaskList>}
   */
  async verifyDates (cdoIndexNumber, verificationDates, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)
    const preNeuteringConfirmation = cdoTaskList.cdoSummary.neuteringConfirmation
    const preMicrochipVerificationn = cdoTaskList.cdoSummary.microchipVerification
    const preNeuteringDeadline = cdoTaskList.cdoSummary.neuteringDeadline
    const preMicrochipDeadline = cdoTaskList.cdoSummary.microchipDeadline

    const callback = exemption => async () => {
      const preAudit = {
        index_number: cdoIndexNumber,
        neutering_confirmation: preNeuteringConfirmation ?? null,
        microchip_verification: preMicrochipVerificationn ?? null,
        neutering_deadline: preNeuteringDeadline ?? null,
        microchip_deadline: preMicrochipDeadline ?? null
      }
      const postAudit = {
        index_number: cdoIndexNumber,
        neutering_confirmation: exemption.neuteringConfirmation,
        microchip_verification: exemption.microchipVerification,
        neutering_deadline: exemption.neuteringDeadline ?? null,
        microchip_deadline: exemption.microchipDeadline ?? null
      }
      await sendUpdateToAudit(EXEMPTION, preAudit, postAudit, user)
    }

    cdoTaskList.verifyDates({
      microchipVerification: verificationDates.microchipVerification,
      neuteringConfirmation: verificationDates.neuteringConfirmation,
      microchipDeadline: verificationDates.microchipDeadline,
      dogNotNeutered: verificationDates.dogNotNeutered,
      dogNotFitForMicrochip: verificationDates.dogNotFitForMicrochip
    }, callback)

    return this.cdoRepository.saveCdoTaskList(cdoTaskList)
  }

  async issueCertificate (cdoIndexNumber, sentDate, user) {
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(cdoIndexNumber)

    const preAuditExemption = {
      index_number: cdoIndexNumber,
      certificate_issued: cdoTaskList.cdoSummary.certificateIssued
    }
    const postAuditExemption = {
      index_number: cdoIndexNumber,
      certificate_issued: sentDate
    }

    const preAuditDog = {
      index_number: cdoIndexNumber,
      status: cdoTaskList.cdoSummary.status
    }
    const postAuditDog = {
      index_number: cdoIndexNumber,
      status: 'Exempt'
    }

    const callback = async () => {
      await sendUpdateToAudit(EXEMPTION, preAuditExemption, postAuditExemption, user)
      await sendUpdateToAudit(DOG, preAuditDog, postAuditDog, user)
    }

    cdoTaskList.issueCertificate(sentDate, callback)

    await this.cdoRepository.saveCdoTaskList(cdoTaskList)

    return sentDate
  }

  async submitFormTwo (indexNumber, payload, user) {
    /**
     * @type {CdoTaskList}
     */
    const cdoTaskList = await this.cdoRepository.getCdoTaskList(indexNumber)
    const microchipDate = payload.dogNotFitForMicrochip ? payload.microchipDeadline : payload.microchipVerification

    const sendEmailCallback = async () => sendForm2Emails(
      indexNumber,
      cdoTaskList.dog.name,
      cdoTaskList.dog.microchipNumber,
      payload.dogNotFitForMicrochip, // unfit - boolean (from payload?)
      microchipDate, // microchip_date (from payload?) - as string object not date
      payload.neuteringConfirmation, // neutering date (from payload?) - as string object not date (or empty string),
      payload.dogNotNeutered, // under16 (from payload)
      user.username // user.username
    )

    await this.cdoRepository.submitFormTwo(indexNumber, cdoTaskList, payload, user, sendEmailCallback)
  }

  /**
   * @param indexNumber
   * @param cdoTaskList
   * @param {{ microchipVerification: string; neuteringConfirmation: string; microchipDeadline: string; dogNotNeutered: boolean; dogNotFitForMicrochip: boolean }} payload
   * @param {{ username; string }} user
   * @returns {Promise<void>}
   * @private
   */
  async _sendForm2EmailsFromTaskList (indexNumber, cdoTaskList, payload, { username }) {
    const microchipDate = payload.dogNotFitForMicrochip ? payload.microchipDeadline : payload.microchipVerification

    return sendForm2Emails(
      indexNumber,
      cdoTaskList.dog.name,
      cdoTaskList.dog.microchipNumber,
      payload.dogNotFitForMicrochip, // unfit - boolean (from payload?)
      microchipDate, // microchip_date (from payload?) - as string object not date
      payload.neuteringConfirmation, // neutering date (from payload?) - as string object not date (or empty string),
      payload.dogNotNeutered, // under16 (from payload)
      username // user.username
    )
  }
}

module.exports = { CdoService }
