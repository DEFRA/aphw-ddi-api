const buildCdoTaskListDtoTasks = (partialCdoTaskListDto = {}) => ({
  applicationPackSent: {
    key: 'applicationPackSent',
    available: true,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  insuranceDetailsRecorded: {
    key: 'insuranceDetailsRecorded',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  microchipNumberRecorded: {
    key: 'microchipNumberRecorded',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  applicationFeePaid: {
    key: 'applicationFeePaid',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  form2Sent: {
    key: 'form2Sent',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  verificationDateRecorded: {
    key: 'verificationDateRecorded',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
  certificateIssued: {
    key: 'certificateIssued',
    available: false,
    completed: false,
    readonly: false,
    timestamp: undefined
  },
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
