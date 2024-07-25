const mapTaskToTaskDto = (task) => ({
  key: task.key,
  available: task.available,
  completed: task.completed,
  readonly: task.readonly,
  timestamp: task.timestamp
})
/**
 * @typedef CdoTaskDto
 * @property {string} key
 * @property {boolean} available
 * @property {boolean} completed
 * @property {boolean} readonly
 * @property {string|undefined} timestamp
 */
/**
 * @typedef CdoTaskListTasksDto
 * @property {CdoTaskDto} applicationPackSent
 * @property {CdoTaskDto} microchipNumberRecorded
 * @property {CdoTaskDto} applicationFeePaid
 * @property {CdoTaskDto} insuranceDetailsRecorded
 * @property {CdoTaskDto} form2Sent
 * @property {CdoTaskDto} verificationDateRecorded
 * @property {CdoTaskDto} certificateIssued
 */
/**
 * @typedef CdoTaskListDto
 * @property {CdoTaskListTasksDto} tasks
 * @property {Date|undefined} applicationPackSent
 * @property {string|undefined} insuranceCompany
 * @property {Date|undefined} insuranceRenewal
 * @property {string|undefined} microchipNumber
 * @property {Date|undefined} applicationFeePaid
 * @property {Date|undefined} form2Sent
 * @property {Date|undefined} neuteringConfirmation
 * @property {Date|undefined} microchipVerification
 * @property {Date|undefined} certificateIssued
 */
/**
 * @param {CdoTaskList} cdoTaskList
 * @return {CdoTaskListDto}
 */
const mapCdoTaskListToDto = (cdoTaskList) => ({
  tasks: {
    applicationPackSent: mapTaskToTaskDto(cdoTaskList.applicationPackSent),
    insuranceDetailsRecorded: mapTaskToTaskDto(cdoTaskList.insuranceDetailsRecorded),
    microchipNumberRecorded: mapTaskToTaskDto(cdoTaskList.microchipNumberRecorded),
    applicationFeePaid: mapTaskToTaskDto(cdoTaskList.applicationFeePaid),
    form2Sent: mapTaskToTaskDto(cdoTaskList.form2Sent),
    verificationDateRecorded: mapTaskToTaskDto(cdoTaskList.verificationDateRecorded),
    certificateIssued: mapTaskToTaskDto(cdoTaskList.certificateIssued)
  },
  applicationPackSent: cdoTaskList.cdoSummary.applicationPackSent,
  insuranceCompany: cdoTaskList.cdoSummary.insuranceCompany,
  insuranceRenewal: cdoTaskList.cdoSummary.insuranceRenewal,
  microchipNumber: cdoTaskList.cdoSummary.microchipNumber,
  applicationFeePaid: cdoTaskList.cdoSummary.applicationFeePaid,
  form2Sent: cdoTaskList.cdoSummary.form2Sent,
  neuteringConfirmation: cdoTaskList.cdoSummary.neuteringConfirmation,
  microchipVerification: cdoTaskList.cdoSummary.microchipVerification,
  certificateIssued: cdoTaskList.cdoSummary.certificateIssued
})

module.exports = {
  mapCdoTaskListToDto
}
