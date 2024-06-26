const buildCdoTaskDto = (partialTaskDto) => ({
  key: 'insuranceDetailsRecorded',
  available: false,
  completed: false,
  readonly: false,
  timestamp: undefined,
  ...partialTaskDto
})

const buildCdoTaskListDtoTasks = (partialCdoTaskListDto = {}) => ({
  applicationPackSent: {
    key: 'applicationPackSent',
    available: true
  },
  insuranceDetailsRecorded: buildCdoTaskDto({
    key: 'insuranceDetailsRecorded'
  }),
  microchipNumberRecorded: buildCdoTaskDto({
    key: 'microchipNumberRecorded'
  }),
  applicationFeePaid: buildCdoTaskDto({
    key: 'applicationFeePaid'
  }),
  form2Sent: buildCdoTaskDto({
    key: 'form2Sent'
  }),
  verificationDateRecorded: buildCdoTaskDto({
    key: 'verificationDateRecorded'
  }),
  certificateIssued: buildCdoTaskDto({
    key: 'certificateIssued'
  }),
  ...partialCdoTaskListDto
})

const buildCdoTaskListDto = (partialCdoTaskListDto = {}) => ({
  ...partialCdoTaskListDto,
  tasks: buildCdoTaskListDtoTasks(partialCdoTaskListDto.tasks)
})

module.exports = {
  buildCdoTaskListDto,
  buildCdoTaskListDtoTasks
}
