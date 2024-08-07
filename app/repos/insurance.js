const sequelize = require('../config/db')
const { getInsuranceCompany } = require('../lookups')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { INSURANCE } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')
const { getFindQuery, updateParanoid, findQueryV2 } = require('./shared')

const createInsurance = async (id, data, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createInsurance(id, data, t))
  }

  try {
    const company = await getInsuranceCompany(data.company, transaction)

    if (!company) {
      throw new Error(`Company not found: ${data.company}`)
    }

    const insurance = await sequelize.models.insurance.create({
      company_id: company.id,
      renewal_date: data.renewalDate,
      dog_id: id
    }, { transaction })

    return insurance
  } catch (err) {
    console.error('Error creating insurance:', err)
    throw err
  }
}

/**
 * @param {InsuranceDao} insurance
 * @param {{ company: string; renewalDate: Date }} data
 * @param transaction
 * @return {Promise<*|undefined>}
 */
const updateInsurance = async (insurance, data, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updateInsurance(insurance, data, t))
  }

  try {
    const company = await getInsuranceCompany(data.company)

    if (!company) {
      throw new Error(`Company not found: ${data.company}`)
    }

    await insurance.update({
      company_id: company.id,
      renewal_date: data.renewalDate
    }, { transaction })

    return insurance
  } catch (err) {
    console.error('Error updating insurance:', err)
    throw err
  }
}

/**
 * @param {{key: string; order?: 'ASC'|'DESC'}} [sort]
 * @return {Promise<{name: string, id: number}[]>}
 */
const getCompanies = async (sort = { key: 'company_name', order: 'ASC' }) => {
  let sortColumn = sequelize.fn('lower', sequelize.col('company_name'))

  if (sort.key === 'updated_at') {
    sortColumn = sequelize.col('updatedOrCreatedAt')
  }

  const sortOrder = sort.order === 'DESC' ? 'DESC' : 'ASC'

  const companies = await sequelize.models.insurance_company.findAll({
    attributes: {
      include: [[sequelize.fn('COALESCE', sequelize.col('updated_at'), sequelize.col('created_at'), new Date(0)), 'updatedOrCreatedAt']]
    },
    order: [[sortColumn, sortOrder]]
  })

  return companies.map((company) => ({
    id: company.id,
    name: company.company_name
  }))
}

const createOrUpdateInsurance = async (data, cdo, transaction) => {
  const updateInsuranceDetailsRecorded = async (cdo, insurance, transaction) => {
    cdo.registration.insurance_details_recorded = insurance.updated_at ?? new Date()
    await cdo.registration.save({ transaction })
  }

  await (createOrUpdateInsuranceWithCommand(data, cdo, updateInsuranceDetailsRecorded, transaction))
}

const createOrUpdateInsuranceWithCommand = async (data, cdo, callback, transaction) => {
  const insurance = cdo.insurance.sort((a, b) => b.id - a.id)[0]

  if (data.insurance) {
    if (!insurance) {
      const insuranceDao = await createInsurance(cdo.id, {
        company: data.insurance.company,
        renewalDate: data.insurance.renewalDate
      }, transaction)
      await callback(cdo, insuranceDao, transaction)
    } else {
      const insuranceDao = await updateInsurance(insurance, {
        company: data.insurance.company,
        renewalDate: data.insurance.renewalDate
      }, transaction)
      await callback(cdo, insuranceDao, transaction)
    }
  }
}

/**
 * @param {{ id: number; company_name: string }} insuranceCompanyDao
 * @return {{ id: number; name: string }}
 */
const mapInsuranceCompanyDaoToDto = (insuranceCompanyDao) => {
  return { id: insuranceCompanyDao.id, name: insuranceCompanyDao.company_name }
}

const addCompany = async (insuranceCompany, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => addCompany(insuranceCompany, user, t))
  }

  const findQuery = getFindQuery(insuranceCompany.name, 'company_name')

  const foundInsuranceCompany = await sequelize.models.insurance_company.findOne(findQuery)

  if (foundInsuranceCompany !== null) {
    throw new DuplicateResourceError(`Insurance company with name ${insuranceCompany.name} is already listed`)
  }
  let createdInsuranceCompany

  const foundParanoid = await sequelize.models.insurance_company.findOne({
    ...findQueryV2(insuranceCompany.name, 'company_name'),
    paranoid: false
  })

  if (foundParanoid) {
    createdInsuranceCompany = await updateParanoid(
      foundParanoid,
      { company_name: insuranceCompany.name },
      transaction
    )
  } else {
    createdInsuranceCompany = await sequelize.models.insurance_company.create({
      company_name: insuranceCompany.name
    }, { transaction })
  }

  const insuranceCompanyDto = mapInsuranceCompanyDaoToDto(createdInsuranceCompany)

  await sendCreateToAudit(INSURANCE, insuranceCompanyDto, user)

  return insuranceCompanyDto
}

const deleteCompany = async (insuranceCompanyId, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteCompany(insuranceCompanyId, user, t))
  }

  const foundInsuranceCompany = await sequelize.models.insurance_company.findOne({
    where: {
      id: insuranceCompanyId
    }
  })

  if (foundInsuranceCompany === null) {
    throw new NotFoundError(`Insurance company with id ${insuranceCompanyId} does not exist`)
  }

  const destroyedInsuranceCompany = await sequelize.models.insurance_company.destroy({
    where: {
      id: insuranceCompanyId
    },
    transaction
  })
  const insuranceCompanyDto = mapInsuranceCompanyDaoToDto(foundInsuranceCompany)

  await sendDeleteToAudit(INSURANCE, insuranceCompanyDto, user)

  return destroyedInsuranceCompany
}

module.exports = {
  createInsurance,
  updateInsurance,
  createOrUpdateInsurance,
  createOrUpdateInsuranceWithCommand,
  getCompanies,
  addCompany,
  deleteCompany
}
