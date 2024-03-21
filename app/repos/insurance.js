const sequelize = require('../config/db')
const { getInsuranceCompany } = require('../lookups')

const createInsurance = async (id, data, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createInsurance(data, t))
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
    return sequelize.transaction(async (t) => updateInsurance(insurance, data, t))
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

const getCompanies = async () => {
  const companies = await sequelize.models.insurance_company.findAll()

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

module.exports = {
  createInsurance,
  updateInsurance,
  createOrUpdateInsurance,
  getCompanies
}
