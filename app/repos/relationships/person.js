const { Op } = require('sequelize')

const personRelationship = (sequelize, latestAddress = true) => {
  const addressWhere = latestAddress
    ? {
        where: {
          id: {
            [Op.in]: sequelize.literal('(SELECT max(id) as id FROM person_address GROUP BY person_id)')
          }
        }
      }
    : {}

  return [
    {
      model: sequelize.models.person_address,
      as: 'addresses',
      ...addressWhere,
      include: [
        {
          model: sequelize.models.address,
          as: 'address',
          include: [
            {
              attribute: ['country'],
              model: sequelize.models.country,
              as: 'country'
            }
          ]
        }
      ]
    },
    {
      model: sequelize.models.person_contact,
      as: 'person_contacts',
      separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
      include: [
        {
          model: sequelize.models.contact,
          as: 'contact',
          include: [
            {
              model: sequelize.models.contact_type,
              as: 'contact_type'
            }
          ]
        }
      ]
    },
    {
      model: sequelize.models.organisation,
      as: 'organisation'
    }
  ]
}

module.exports = {
  personRelationship
}
