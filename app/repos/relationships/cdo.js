const cdoRelationships = sequelize => [
  {
    model: sequelize.models.registered_person,
    as: 'registered_person',
    include: [{
      model: sequelize.models.person,
      as: 'person',
      include: [{
        model: sequelize.models.person_address,
        as: 'addresses',
        include: [{
          model: sequelize.models.address,
          as: 'address',
          include: [{
            attribute: ['country'],
            model: sequelize.models.country,
            as: 'country'
          }]
        }]
      },
      {
        model: sequelize.models.person_contact,
        as: 'person_contacts',
        separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
        include: [{
          model: sequelize.models.contact,
          as: 'contact',
          include: [{
            model: sequelize.models.contact_type,
            as: 'contact_type'
          }]
        }]
      },
      {
        model: sequelize.models.organisation,
        as: 'organisation'
      }]
    },
    {
      model: sequelize.models.person_type,
      as: 'person_type'
    }]
  },
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
  cdoRelationships
}
