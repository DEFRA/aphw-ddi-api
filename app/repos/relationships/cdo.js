const { personRelationship } = require('./person')

const cdoRelationship = sequelize => [
  {
    model: sequelize.models.registered_person,
    as: 'registered_person',
    include: [{
      model: sequelize.models.person,
      as: 'person',
      include: personRelationship(sequelize)
    }]
  },
  {
    model: sequelize.models.dog_breed,
    as: 'dog_breed'
  },
  {
    model: sequelize.models.dog_breach,
    as: 'dog_breaches',
    include: [{
      model: sequelize.models.breach_category,
      as: 'breach_category'
    }]
  },
  {
    model: sequelize.models.status,
    as: 'status'
  },
  {
    model: sequelize.models.registration,
    as: 'registration',
    include: [
      {
        model: sequelize.models.police_force,
        as: 'police_force',
        paranoid: false
      },
      {
        model: sequelize.models.court,
        as: 'court',
        paranoid: false
      },
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      },
      {
        model: sequelize.models.form_two,
        as: 'form_two'
      }
    ]
  },
  {
    model: sequelize.models.insurance,
    as: 'insurance',
    include: {
      model: sequelize.models.insurance_company,
      as: 'company',
      paranoid: false
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
