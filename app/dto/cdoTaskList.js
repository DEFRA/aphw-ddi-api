const mapCdoTaskListToDto = (cdoTaskList) => ({
  tasks: {
    applicationPackSent: cdoTaskList.applicationPackSent,
    insuranceDetailsRecorded: cdoTaskList.insuranceDetailsRecorded,
    microchipNumberRecorded: cdoTaskList.microchipNumberRecorded,
    applicationFeePaid: cdoTaskList.applicationFeePaid,
    form2Sent: cdoTaskList.form2Sent,
    verificationDateRecorded: cdoTaskList.verificationDateRecorded,
    certificateIssued: cdoTaskList.certificateIssued
  }
})

module.exports = {
  mapCdoTaskListToDto
}
