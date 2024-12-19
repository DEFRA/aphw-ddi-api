const { buildBreachCategoryDao } = require('./get')
const { BreachCategory } = require('../../../app/data/domain')

/**
 * @param {Partial<CdoTaskDto>} partialTaskDto
 * @return {CdoTaskDto}
 */
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
  applicationPackProcessed: buildCdoTaskDto({
    key: 'applicationPackProcessed'
  }),
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
  indexNumber: 'ED300097',
  verificationOptions: {
    dogDeclaredUnfit: false,
    neuteringBypassedUnder16: false,
    allowDogDeclaredUnfit: true,
    allowNeuteringBypass: false,
    showNeuteringBypass: true
  },
  ...partialCdoTaskListDto,
  tasks: buildCdoTaskListDtoTasks(partialCdoTaskListDto.tasks)
})

/**
 * @param {Partial<BreachCategory>} partialBreachCategory
 * @return {BreachDto}
 */
const buildBreachDto = (partialBreachCategory) => {
  const breachCategory = new BreachCategory(buildBreachCategoryDao(partialBreachCategory))
  return breachCategory.label ?? 'dog not covered by third party insurance'
}

/**
 * @param {Partial<DogDto>} partialDogDto
 * @return {DogDto}
 */
const buildDogDto = (partialDogDto) => ({
  id: 300097,
  indexNumber: 'ED300097',
  name: 'Rex300',
  breed: 'XL Bully',
  colour: null,
  sex: null,
  dateOfBirth: null,
  dateOfDeath: null,
  tattoo: null,
  microchipNumber: null,
  microchipNumber2: null,
  dateExported: null,
  dateStolen: null,
  dateUntraceable: null,
  breaches: [],
  ...partialDogDto
})

module.exports = {
  buildCdoTaskDto,
  buildCdoTaskListDto,
  buildCdoTaskListDtoTasks,
  buildBreachDto,
  buildDogDto
}
