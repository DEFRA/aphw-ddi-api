const { personRelationship } = require('./person')

const cdoRelationship = sequelize => [
  ...personRelationship,
  {
    model: sequelize.models.dog_breed,
    as: 'dog_breed'
  },
  {
    model: sequelize.models.status,
    as: 'status'
  },
  {
    model: sequelize.models.registration,
    as: 'registration',
    include: [{
      model: sequelize.models.police_force,
      as: 'police_force'
    },
    {
      model: sequelize.models.court,
      as: 'court'
    },
    {
      model: sequelize.models.exemption_order,
      as: 'exemption_order'
    }]
  },
  {
    model: sequelize.models.insurance,
    as: 'insurance',
    include: {
      model: sequelize.models.insurance_company,
      as: 'company'
    }
  },
  {
    model: sequelize.models.dog_microchip,
    as: 'dog_microchips',
    include: [{
      model: sequelize.models.microchip,
      as: 'microchip'
    }]
  }
]

module.exports = {
  cdoRelationship
}
