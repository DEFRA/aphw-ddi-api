const db = require('../data')

const getDogById = async (id) => {
  return db.dog.findByPk(id, {
    include: [{
      model: db.dog_breed,
      as: 'dog_breed'
    },
    {
      model: db.status,
      as: 'status'
    },
    {
      model: db.registered_person,
      as: 'registered_person',
      include: [{
        model: db.person,
        as: 'person',
        include: {
          model: db.person_address,
          as: 'addresses',
          include: {
            model: db.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: db.country,
              as: 'country'
            },
            {
              model: db.county,
              as: 'county'
            }]
          }
        }
      },
      {
        model: db.person_type,
        as: 'person_type'
      }]
    }]
  })
}

module.exports = {
  getDogById
}
