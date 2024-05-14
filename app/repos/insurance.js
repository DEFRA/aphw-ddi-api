const sequelize = require('../config/db')
const { getInsuranceCompany } = require('../lookups')
const { Op } = require('sequelize')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')
const { INSURANCE } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/not-found')

const createInsurance = async (id, data, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createInsurance(data, t))
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
    console.error(`Error creating insurance: ${err}`)
    throw err
  }
}

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
    console.error(`Error updating insurance: ${err}`)
    throw err
  }
}

/**
 * @param {{key: string; order?: 'ASC'|'DESC'}} [sort]
 * @return {Promise<{name: string, id: number}[]>}
 */
const getCompanies = async (sort = { key: 'company_name', order: 'ASC' }) => {
  let sortColumn = sequelize.col('company_name')

  if (sort.key === 'updated_at') {
    sortColumn = sequelize.col('updated_at')
  }

  const sortOrder = sort.order === 'DESC' ? 'DESC' : 'ASC'

  const companies = await sequelize.models.insurance_company.findAll({
    order: [[sortColumn, sortOrder]]
  })

  return companies.map((company) => ({
    id: company.id,
    name: company.company_name
  }))
}

const createOrUpdateInsurance = async (data, cdo, transaction) => {
  const insurance = cdo.insurance.sort((a, b) => b.id - a.id)[0]

  if (data.insurance) {
    if (!insurance) {
      await createInsurance(cdo.id, {
        company: data.insurance.company,
        renewalDate: data.insurance.renewalDate
      }, transaction)
    } else {
      await updateInsurance(insurance, {
        company: data.insurance.company,
        renewalDate: data.insurance.renewalDate
      }, transaction)
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

  const findQuery = {
    where: {
      company_name: {
        [Op.iLike]: `%${insuranceCompany.name}%`
      }
    }
  }
  const foundInsuranceCompany = await sequelize.models.insurance_company.findOne(findQuery)

  if (foundInsuranceCompany !== null) {
    throw new DuplicateResourceError(`Insurance company with name ${insuranceCompany.name} already exists`)
  }
  let createdInsuranceCompany

  const foundParanoid = await sequelize.models.insurance_company.findOne({
    ...findQuery,
    paranoid: false
  })

  if (foundParanoid) {
    await sequelize.models.insurance_company.restore({
      where: {
        id: foundParanoid.id
      },
      transaction
    })
    createdInsuranceCompany = foundParanoid
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
  getCompanies,
  addCompany,
  deleteCompany
}
