const personTableRelationships = (sequelize) => [
  {
    model: sequelize.models.person_address,
    as: 'addresses',
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
    separate: true,
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

module.exports = {
  personTableRelationships
}
