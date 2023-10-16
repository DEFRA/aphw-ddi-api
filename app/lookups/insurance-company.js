const { Op } = require('sequelize')
const sequelize = require('../config/db')

const getInsuranceCompany = async company => {
  return await sequelize.models.insurance_company.findOne({
    attributes: ['id'],
    where: {
      company_name: {
        [Op.iLike]: `%${company}%`
      }
    }
  })
}

module.exports = getInsuranceCompany
