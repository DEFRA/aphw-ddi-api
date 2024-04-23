const sequelize = require('../config/db')
const { createPeople, getPersonByReference, updatePersonFields } = require('./people')
const { createDogs } = require('./dogs')
const { addToSearchIndex } = require('./search')
const { sendCreateToAudit } = require('../messaging/send-audit')
const { CDO } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')
const { mapPersonDaoToCreatedPersonDao } = require('./mappers/person')
const { cdoRelationship } = require('./relationships/cdo')
const { statuses } = require('../constants/statuses')
const { Op } = require('sequelize')

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
 * @typedef InsuranceDao
 * @property {number} id
 * @property {null|string} policy_number
 * @property {number} company_id
 * @property {string} renewal_date
 * @property {number} dog_id
 * @property  {{id: number; company_name: string}} company
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
 * @property {string} certificate_issued
 * @property {string} legislation_officer
 * @property {string} application_fee_paid
 * @property {string} neutering_confirmation
 * @property {string} microchip_verification
 * @property {string} joined_exemption_scheme
 * @property {null|string} withdrawn
 * @property {null|string} typed_by_dlo
 * @property {null|string} microchip_deadline
 * @property {null|string} neutering_deadline
 * @property {null|string} removed_from_cdo_process
 * @property {null|string} deleted_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {PoliceForceDao} police_force
 * @property {CourtDao} court
 * @property {ExemptionOrderDao} exemption_order
 */
/**
 * @typedef SummaryRegistrationDao
 * @property {number} id
 * @property {string} cdo_expiry
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
 * @property {string} dog_reference
 * @property {null|string} exported_date
 * @property {InsuranceDao[]} insurance
 * @property {string} name
 * @property {RegisteredPersonDao[]} registered_person
 * @property {RegistrationDao} registration
 * @property {null|string} sex
 * @property {StatusDao} status
 * @property {number} status_id
 * @property {null|string} stolen_date
 * @property {null|string} tattoo
 * @property {null|string} untraceable_date
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
 * @param data
 * @param user
 * @param transaction
 * @return {Promise<*|{owner: CreatedPersonDao, dogs: (Promise<*>|[])}|undefined|{owner: CreatedPersonDao, dogs: (*|[])}>}
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
        const entity = {
          owner,
          dog
        }
        await sendCreateToAudit(CDO, entity, user)
      }
    }

    const cdo = {
      owner: owners[0],
      dogs
    }

    return cdo
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

/**
 * @param indexNumber
 * @return {Promise<CdoDao>}
 */
const getCdo = async (indexNumber) => {
  const cdo = await sequelize.models.dog.findAll({
    where: { index_number: indexNumber },
    order: [[sequelize.col('registered_person.person.addresses.address.id'), 'DESC'],
      [sequelize.col('dog_microchips.microchip.id'), 'ASC']],
    include: cdoRelationship(sequelize)
  })

  return cdo?.length > 0 ? cdo[0] : null
}

/**
 * @return {Promise<CdoDao[]>}
 */
const getAllCdos = async () => {
  const cdos = await sequelize.models.dog.findAll({
    order: [
      [sequelize.col('dog.id'), 'ASC'],
      [sequelize.col('registered_person.person.addresses.address.id'), 'DESC']
    ],
    include: cdoRelationship(sequelize)
  })

  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true'
  return cdos
}

/**
 * @typedef {'InterimExempt'|'PreExempt'|'Exempt'|'Failed'|'InBreach'|'Withdrawn'|'Inactive'} CdoStatus
 */
/**
 *
 * @param {{ status?: CdoStatus[]; withinDays?: number }} [filter]
 * @return {Promise<SummaryCdo[]>}
 */
const getSummaryCdos = async (filter) => {
  const where = {}

  if (filter.status) {
    const statusArray = filter.status.map(status => statuses[status])
    where['$status.status$'] = statusArray
  }

  if (filter.withinDays) {
    const day = 24 * 60 * 60 * 1000
    const withinMilliseconds = filter.withinDays * day
    const now = Date.now()
    const withinDaysDate = new Date(now + withinMilliseconds)

    where['$registration.cdo_expiry$'] = {
      [Op.lte]: withinDaysDate
    }
  }

  const cdos = await sequelize.models.dog.findAll({
    attributes: ['id', 'index_number', 'status_id'],
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
        attributes: ['id', 'cdo_expiry'],
        include: [
          {
            model: sequelize.models.police_force,
            as: 'police_force'
          }
        ]
      }
    ],
    order: [[sequelize.col('registration.cdo_expiry'), 'ASC']]
  })

  return cdos
}

module.exports = {
  createCdo,
  getCdo,
  getSummaryCdos,
  getAllCdos
}
