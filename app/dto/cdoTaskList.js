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
 * @property {CdoTaskDto} applicationPackProcessed
 * @property {CdoTaskDto} microchipNumberRecorded
 * @property {CdoTaskDto} applicationFeePaid
 * @property {CdoTaskDto} insuranceDetailsRecorded
 * @property {CdoTaskDto} form2Sent
 * @property {CdoTaskDto} verificationDateRecorded
 * @property {CdoTaskDto} certificateIssued
 */
/**
 * @typedef CdoSummary
 * @property {{ name: string }} dog
 * @property {{ cdoExpiry: Date|undefined }} exemption
 * @property {{ firstname: string; lastName: string }} person
 */
/**
 * @typedef CdoTaskListDto
 * @property {string} indexNumber
 * @property {CdoTaskListTasksDto} tasks
 * @property {Date|undefined} applicationPackSent
 * @property {Date|undefined} applicationPackProcessed
 * @property {string|undefined} insuranceCompany
 * @property {Date|undefined} insuranceRenewal
 * @property {string|undefined} microchipNumber
 * @property {Date|undefined} applicationFeePaid
 * @property {Date|undefined} form2Sent
 * @property {Date|undefined} neuteringConfirmation
 * @property {Date|undefined} microchipVerification
 * @property {Date|undefined} certificateIssued
 * @property {CdoSummary} cdoSummary
 */
/**
 * @param {CdoTaskList} cdoTaskList
 * @return {CdoTaskListDto}
 */
const mapCdoTaskListToDto = (cdoTaskList) => ({
  indexNumber: cdoTaskList.cdoSummary.indexNumber,
  tasks: {
    applicationPackSent: mapTaskToTaskDto(cdoTaskList.applicationPackSent),
    applicationPackProcessed: mapTaskToTaskDto(cdoTaskList.applicationPackProcessed),
    insuranceDetailsRecorded: mapTaskToTaskDto(cdoTaskList.insuranceDetailsRecorded),
    microchipNumberRecorded: mapTaskToTaskDto(cdoTaskList.microchipNumberRecorded),
    applicationFeePaid: mapTaskToTaskDto(cdoTaskList.applicationFeePaid),
    form2Sent: mapTaskToTaskDto(cdoTaskList.form2Sent),
    verificationDateRecorded: mapTaskToTaskDto(cdoTaskList.verificationDateRecorded),
    certificateIssued: mapTaskToTaskDto(cdoTaskList.certificateIssued)
  },
  verificationOptions: {
    dogDeclaredUnfit: cdoTaskList.verificationOptions.dogDeclaredUnfit,
    neuteringBypassedUnder16: cdoTaskList.verificationOptions.neuteringBypassedUnder16,
    allowDogDeclaredUnfit: cdoTaskList.verificationOptions.allowDogDeclaredUnfit,
    allowNeuteringBypass: cdoTaskList.verificationOptions.allowNeuteringBypass,
    showNeuteringBypass: cdoTaskList.verificationOptions.showNeuteringBypass
  },
  applicationPackSent: cdoTaskList.cdoSummary.applicationPackSent,
  applicationPackProcessed: cdoTaskList.cdoSummary.applicationPackProcessed,
  insuranceCompany: cdoTaskList.cdoSummary.insuranceCompany,
  insuranceRenewal: cdoTaskList.cdoSummary.insuranceRenewal,
  microchipNumber: cdoTaskList.cdoSummary.microchipNumber,
  microchipNumber2: cdoTaskList.cdoSummary.microchipNumber2,
  applicationFeePaid: cdoTaskList.cdoSummary.applicationFeePaid,
  form2Sent: cdoTaskList.cdoSummary.form2Sent,
  form2Submitted: cdoTaskList.cdoSummary.form2Submitted,
  neuteringConfirmation: cdoTaskList.cdoSummary.neuteringConfirmation,
  microchipVerification: cdoTaskList.cdoSummary.microchipVerification,
  microchipDeadline: cdoTaskList.cdoSummary.microchipDeadline,
  certificateIssued: cdoTaskList.cdoSummary.certificateIssued,
  cdoSummary: {
    exemption: {
      cdoExpiry: cdoTaskList.cdoSummary.cdoExpiry
    },
    person: {
      firstName: cdoTaskList.cdoSummary.ownerFirstName,
      lastName: cdoTaskList.cdoSummary.ownerLastName
    },
    dog: {
      name: cdoTaskList.cdoSummary.dogName
    }
  }
})

module.exports = {
  mapCdoTaskListToDto
}
