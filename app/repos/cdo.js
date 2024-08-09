const sequelize = require('../config/db')
const { createPeople, getPersonByReference, updatePersonFields } = require('./people')
const { createDogs, updateStatus } = require('./dogs')
const { addToSearchIndex } = require('./search')
const { sendCreateToAudit, sendChangeOwnerToAudit } = require('../messaging/send-audit')
const { CDO } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')
const { mapPersonDaoToCreatedPersonDao } = require('./mappers/person')
const { cdoRelationship } = require('./relationships/cdo')
const { statuses } = require('../constants/statuses')
const { Op } = require('sequelize')
const { mapCdoDaoToCdo } = require('./mappers/cdo')
const { CdoTaskList } = require('../data/domain')
const { createOrUpdateInsuranceWithCommand } = require('./insurance')
const { updateMicrochipKey } = require('./microchip')
const domain = require('../constants/domain')

/**
 * @typedef DogBreedDao
 * @property {boolean} active
 * @property {string} breed
 * @property {number} display_order
 */
/**
 * @typedef MicrochipDao
 * @property {number} id
 * @property {string} microchip_number
 * @property {string} created_at
 * @property {null|string} deleted_at
 * @property {string} updated_at
 */

/**
 * @typedef DogMicrochipDao
 * @property {number} id
 * @property {number} dog_id
 * @property {number} microchip_id
 * @property {MicrochipDao} microchip
 * @property {string} updated_at
 * @property {string} created_at
 * @property {null|string} deleted_at
 */

/**
 * @typedef BreachCategoryDao
 * @property {number} id
 * @property {string} label
 * @property {string} short_name
 */

/**
 * @typedef DogBreachDao
 * @property {number} id
 * @property {number} dog_id
 * @property {number} breach_category_id
 * @property {BreachCategoryDao} breach_category
 * @property {string|null} updated_at
 * @property {string} created_at
 * @property {null|string} deleted_at
 */

/**
 * @typedef InsuranceDao
 * @property {number} id
 * @property {null|string} policy_number
 * @property {number} company_id
 * @property {string} renewal_date
 * @property {number} dog_id
 * @property  {{id: number; company_name: string}} company
 * @property update
 */

/**
 * @typedef RegisteredPersonDao
 * @property {number}  id
 * @property {number} person_id
 * @property {number} dog_id
 * @property {number} person_type_id
 * @property {PersonDao} person
 * @property {string} created_at
 * @property {null|string} deleted_at
 * @property {string} updated_at
 */

/**
 * @typedef SummaryRegisteredPersonDao
 * @property {number}  id
 * @property {SummmaryPersonDao} person
 */
/**
 * @typedef PoliceForceDao
 * @property {number} id
 * @property {string} name
 */
/**
 * @typedef {{ id: number; name: string; created_at: string|null; deleted_at: string|null; updated_at: string|null }} CourtDao
 */
/**
 * @typedef {{ id: number; exemption_order: string; active: boolean}} ExemptionOrderDao
 */
/**
 * @typedef RegistrationDao
 * @property {number} id
 * @property {number} dog_id
 * @property {number} status_id
 * @property {number} police_force_id
 * @property {number} court_id
 * @property {number} exemption_order_id
 * @property {string} cdo_issued
 * @property {string} cdo_expiry
 * @property {null|string} time_limit
 * @property {null|string} legislation_officer
 * @property {null|Date} certificate_issued
 * @property {null|Date} application_fee_paid
 * @property {null|Date} neutering_confirmation
 * @property {null|Date} microchip_verification
 * @property {null|Date} joined_exemption_scheme
 * @property {null|Date} withdrawn
 * @property {null|string} typed_by_dlo
 * @property {null|Date} microchip_deadline
 * @property {null|Date} neutering_deadline
 * @property {null|Date} non_compliance_letter_sent
 * @property {null|Date} application_pack_sent
 * @property {null|Date} form_two_sent
 * @property {null|Date} insurance_details_recorded
 * @property {null|Date} microchip_number_recorded
 * @property {null|Date} application_fee_payment_recorded
 * @property {null|Date} verification_dates_recorded
 * @property {null|string} deleted_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {PoliceForceDao} police_force
 * @property {CourtDao} court
 * @property {ExemptionOrderDao} exemption_order
 * @property {() => void} [save]
 */
/**
 * @typedef SummaryRegistrationDao
 * @property {number} id
 * @property {string|null} cdo_expiry
 * @property {string|null} joined_exemption_scheme
 * @property {string|null} non_compliance_letter_sent
 * @property {PoliceForceDao} police_force
 */
/**
 * @typedef {'Interim exempt'|'Pre-exempt'|'Exempt'|'Failed'|'In breach'|'Withdrawn'|'Inactive'} StatusLabel
 */
/**
 * @typedef StatusDao
 * @property {number} id
 * @property {StatusLabel} status
 * @property {'IMPORT'|'DOG'|'STANDARD'} status_type
 */
/**
 * @typedef CdoDao
 * @property {number} id
 * @property {string} index_number
 * @property {null|string} birth_date
 * @property {null|string} colour
 * @property {null|string} death_date
 * @property {DogBreedDao} dog_breed
 * @property {number} dog_breed_id
 * @property {DogMicrochipDao[]} dog_microchips
 * @property {DogBreachDao[]} dog_breaches
 * @property {string} dog_reference
 * @property {null|string} exported_date
 * @property {InsuranceDao[]} insurance
 * @property {string} name
 * @property {RegisteredPersonDao[]} registered_person
 * @property {RegistrationDao} registration
 * @property {null|string} sex
 * @property {StatusDao} status
 * @property {number} status_id
 * @property {null|Date} stolen_date
 * @property {null|Date} tattoo
 * @property {null|Date} untraceable_date
 * @property {string} updated_at
 * @property {string} created_at
 * @property {null|string} deleted_at
 */

/**
 * @typedef {CdoDao} SummaryCdo
 * @property {number} id
 * @property {string} index_number
 * @property {number} status_id
 * @property {SummaryRegisteredPersonDao[]} registered_person
 * @property {SummaryRegistrationDao} registration
 * @property {StatusDao} status
 */
/**
 * @typedef CreateCdo
 * @param data
 * @param user
 * @param transaction
 * @return {Promise<*|{owner: CreatedPersonDao, dogs: (Promise<*>|[])}|undefined|{owner: CreatedPersonDao, dogs: (*|[])}>}
 */
/**
 * @type CreateCdo
 */
const createCdo = async (data, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createCdo(data, user, t))
  }

  try {
    let owners
    if (data.owner.personReference) {
      const person = await getPersonByReference(data.owner.personReference, transaction)
      if (person === null) {
        throw new NotFoundError('Owner not found')
      }

      if (data.owner.dateOfBirth !== null && person.birth_date == null) {
        await updatePersonFields(person.id, { dateOfBirth: data.owner.dateOfBirth }, user, transaction)
        await person.reload({ transaction })
      }

      owners = [mapPersonDaoToCreatedPersonDao(person)]
    } else {
      owners = await createPeople([data.owner], transaction)
    }

    const dogs = await createDogs(data.dogs, owners, data.enforcementDetails, transaction)

    for (const owner of owners) {
      for (const dog of dogs) {
        await addToSearchIndex(owner, dog, transaction)
        await sendCreateToAudit(CDO, { owner, dog }, user)
        if (dog.changedOwner) {
          await sendChangeOwnerToAudit(dog, user)
        }
      }
    }

    const cdo = {
      owner: owners[0],
      dogs
    }

    return cdo
  } catch (err) {
    console.error('Error creating CDO:', err)
    throw err
  }
}

/**
 * @typedef GetCdo
 * @param indexNumber
 * @param {*} [transaction]
 * @return {Promise<CdoDao>}
 */

/**
 * @type {GetCdo}
 **/
const getCdo = async (indexNumber, transaction) => {
  const cdo = await sequelize.models.dog.findAll({
    where: { index_number: indexNumber },
    order: [[sequelize.col('registered_person.person.addresses.address.id'), 'DESC'],
      [sequelize.col('dog_microchips.microchip.id'), 'ASC']],
    include: cdoRelationship(sequelize),
    transaction
  })

  return cdo?.length > 0 ? cdo[0] : null
}

/**
 * @typedef GetAllCdos
 * @param idStart
 * @param rowLimit
 * @return {Promise<CdoDao[]>}
 */
/**
 * @type {GetAllCdos}
 */
const getAllCdos = async (idStart, rowLimit) => {
  const query = {
    order: [
      [sequelize.col('dog.id'), 'ASC'],
      [sequelize.col('registered_person.person.addresses.address.id'), 'DESC']
    ],
    include: cdoRelationship(sequelize)
  }

  if (idStart && rowLimit) {
    query.where = { '$dog.id$': { [Op.gte]: idStart } }
    query.limit = rowLimit
    query.subQuery = false
  }

  return sequelize.models.dog.findAll(query)
}

/**
 * @typedef {'InterimExempt'|'PreExempt'|'Exempt'|'Failed'|'InBreach'|'Withdrawn'|'Inactive'} CdoStatus
 */

const sortKeys = {
  cdoExpiry: undefined,
  joinedExemptionScheme: 'registration.joined_exemption_scheme',
  policeForce: 'police_force_aggregrate',
  owner: [
    'registered_person.person.last_name',
    'registered_person.person.first_name'
  ],
  indexNumber: 'id'
}

const policeForceCol = 'registration.police_force.name'

/**
 * @typedef CdoSort
 * @property {string} key
 * @property {'ASC'|'DESC'} [order]
 */

/**
 * @typedef GetSortOrder
 * @param {CdoSort} sort
 * @return {*[]}
 */

/**
 * @type {GetSortOrder}
 */
const getSortOrder = (sort) => {
  const order = []

  const sortOrder = sort?.order ?? 'ASC'
  const sortKey = sortKeys[sort?.key]

  if (sortKey !== undefined) {
    if (Array.isArray(sortKey)) {
      sortKey.forEach(key => {
        order.push([sequelize.col(key), sortOrder])
      })
    } else {
      order.push([sequelize.col(sortKey), sortOrder])
    }
  }

  order.push([sequelize.col('registration.cdo_expiry'), sortOrder])

  return order
}

/**
 * @typedef GetSummaryCdos
 * @param {{ status?: CdoStatus[]; withinDays?: number; nonComplianceLetterSent?: boolean }} [filter]
 * @param {CdoSort} [sort]
 * @return {Promise<SummaryCdo[]>}
 */

/**
 * @type {GetSummaryCdos}
 */
const getSummaryCdos = async (filter, sort) => {
  const where = {}

  if (filter.status) {
    const statusArray = filter.status.map(status => statuses[status])
    where['$status.status$'] = statusArray
  }

  if (filter.withinDays) {
    const day = 24 * 60 * 60 * 1000
    const withinMilliseconds = filter.withinDays * day
    const now = new Date()
    now.setUTCHours(0, 0, 0, 0)
    const withinDaysDate = new Date(now.getTime() + withinMilliseconds)

    where['$registration.cdo_expiry$'] = {
      [Op.lte]: withinDaysDate
    }
  }

  if (filter.nonComplianceLetterSent !== undefined) {
    const operation = filter.nonComplianceLetterSent === false ? Op.is : Op.not

    where['$registration.non_compliance_letter_sent$'] = {
      [operation]: null
    }
  }

  const order = getSortOrder(sort)

  const cdos = await sequelize.models.dog.findAll({
    attributes: [
      'id', 'index_number', 'status_id',
      [sequelize.fn('COALESCE', sequelize.col(policeForceCol), 'ZZZZZZ'), 'police_force_aggregrate']
    ],
    where,
    include: [
      {
        model: sequelize.models.registered_person,
        as: 'registered_person',
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at', 'person_id', 'dog_id', 'person_type_id'] },
        include: [{
          model: sequelize.models.person,
          as: 'person',
          attributes: ['id', 'first_name', 'last_name', 'person_reference']
        }]
      },
      {
        model: sequelize.models.status,
        as: 'status'
      },
      {
        model: sequelize.models.registration,
        as: 'registration',
        attributes: ['id', 'cdo_expiry', 'joined_exemption_scheme', 'non_compliance_letter_sent'],
        include: [
          {
            model: sequelize.models.police_force,
            as: 'police_force',
            paranoid: false
          }
        ]
      }
    ],
    order
  })

  return cdos
}
/**
 *
 */

/**
 * @typedef GetCdoModel
 * @param {string} indexNumber
 * @param {*} [transaction]
 * @return {Promise<Cdo>}
 */
/**
 * @type {GetCdoModel}
 */
const getCdoModel = async (indexNumber, transaction) => {
  const cdoDao = await getCdo(indexNumber, transaction)

  if (cdoDao === null) {
    throw new NotFoundError(`CDO does not exist with indexNumber: ${indexNumber}`)
  }

  return mapCdoDaoToCdo(cdoDao)
}

/**
 * @typedef GetCdoTaskList
 * @param {string} indexNumber
 * @param {*} [transaction]
 * @return {Promise<import('../data/domain/cdoTaskList').CdoTaskList>}
 */

/**
 * @type {GetCdoTaskList}
 */
const getCdoTaskList = async (indexNumber, transaction) => {
  const cdo = await getCdoModel(indexNumber, transaction)
  return new CdoTaskList(cdo)
}

/**
 * @typedef SaveCdoTaskList
 * @param {import('../data/domain/cdoTaskList').CdoTaskList} cdoTaskList
 * @param transaction
 * @return {Promise<import('../data/domain/cdoTaskList').CdoTaskList>}
 */
/**
 * @type {SaveCdoTaskList}
 */
const saveCdoTaskList = async (cdoTaskList, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => saveCdoTaskList(cdoTaskList, t))
  }
  const updates = Object.values(cdoTaskList.getUpdates()).flat()
  const cdoDao = await getCdo(cdoTaskList.cdoSummary.indexNumber)

  for (const update of updates) {
    switch (update.key) {
      case 'microchip': {
        await updateMicrochipKey(cdoDao, update.value, 1, transaction)
        break
      }
      case 'insurance': {
        await createOrUpdateInsuranceWithCommand({ insurance: update.value }, cdoDao, async () => {}, transaction)
        break
      }
      case 'status': {
        await updateStatus(cdoDao.index_number, update.value, transaction)
        break
      }
      default: {
        const keys = domain.updateKeys[update.key]
        let model

        for (const key of keys) {
          const mappingArray = domain.updateMappings[key].split('.')
          const [, relationship, field] = mappingArray

          if (!model) {
            model = cdoDao[relationship ?? field]
          }

          if (model) {
            if (Object.prototype.hasOwnProperty.call(update.value, key)) {
              model[field] = update.value[key]
            } else {
              model[field] = update.value
            }
          }
        }

        if (model) {
          await model.save({ transaction })
        } else {
          throw new Error(`Missing model when updating ${update.key}`)
        }
      }
    }

    // this will publish the event
    if (update.callback) {
      await update.callback()
    }
  }

  return getCdoTaskList(cdoTaskList.cdoSummary.indexNumber, transaction)
}
/**
 * @typedef {{
 *    getCdo: GetCdo,
 *    getSummaryCdos: GetSummaryCdos,
 *    getAllCdos: GetAllCdos,
 *    createCdo: CreateCdo,
 *    getCdoModel: GetCdoModel,
 *    getCdoTaskList: GetCdoTaskList,
 *    saveCdoTaskList: SaveCdoTaskList
 * }} CdoRepository
 */
/**
 * @type {CdoRepository}
 */
module.exports = {
  createCdo,
  getCdo,
  getSummaryCdos,
  getAllCdos,
  getCdoModel,
  getCdoTaskList,
  saveCdoTaskList
}
