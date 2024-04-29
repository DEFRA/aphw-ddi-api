const sequelize = require('../../config/db')
const { Op } = require('sequelize')

const ownerSearch = async (criteria) => {
  const results = await sequelize.models.person.findAll({
    attributes: ['person_reference'],
    where: {
      [Op.and]: [
        sequelize.where(sequelize.fn('lower', sequelize.col('first_name')), criteria.firstName.toLowerCase()),
        sequelize.where(sequelize.fn('lower', sequelize.col('last_name')), criteria.lastName.toLowerCase()),
        {
          birth_date: criteria.birthDate
        }
      ]
    }
  })

  return results?.length ? results[0].person_reference : null
}

module.exports = {
  ownerSearch
}
