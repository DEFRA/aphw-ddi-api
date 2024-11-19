const registrationRelationship = sequelize => [
  {
    model: sequelize.models.exemption_order,
    as: 'exemption_order'
  },
  {
    model: sequelize.models.dog,
    as: 'dog',
    include: [
      {
        model: sequelize.models.status,
        as: 'status'
      },
      {
        model: sequelize.models.dog_breed,
        as: 'dog_breed'
      },
      {
        model: sequelize.models.insurance,
        as: 'insurance'
      },
      {
        model: sequelize.models.dog_breach,
        as: 'dog_breaches',
        include: [
          {
            model: sequelize.models.breach_category,
            as: 'breach_category'
          }
        ]
      }
    ]
  }
]

module.exports = {
  registrationRelationship
}
