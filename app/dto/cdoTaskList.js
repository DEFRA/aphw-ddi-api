const mapTaskToTaskDto = (task) => ({
  key: task.key,
  available: task.available,
  completed: task.completed,
  readonly: task.readonly,
  timestamp: task.timestamp
})

const mapCdoTaskListToDto = (cdoTaskList) => ({
  tasks: {
    applicationPackSent: mapTaskToTaskDto(cdoTaskList.applicationPackSent),
    insuranceDetailsRecorded: mapTaskToTaskDto(cdoTaskList.insuranceDetailsRecorded),
    microchipNumberRecorded: mapTaskToTaskDto(cdoTaskList.microchipNumberRecorded),
    applicationFeePaid: mapTaskToTaskDto(cdoTaskList.applicationFeePaid),
    form2Sent: mapTaskToTaskDto(cdoTaskList.form2Sent),
    verificationDateRecorded: mapTaskToTaskDto(cdoTaskList.verificationDateRecorded),
    certificateIssued: mapTaskToTaskDto(cdoTaskList.certificateIssued)
  }
})

module.exports = {
  mapCdoTaskListToDto
}
