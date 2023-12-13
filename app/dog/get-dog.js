const db = require('../data')

const getDogById = async (id) => {
  const dog = await db.dog.findByPk(id, {
    include: [{
      model: db.registered_person,
      as: 'registered_person',
      include: [{
        model: db.person,
        as: 'person',
        include: [{
          model: db.person_address,
          as: 'addresses',
          include: [{
            model: db.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: db.country,
              as: 'country'
            }]
          }]
        },
        {
          model: db.person_contact,
          as: 'person_contacts',
          include: [{
            model: db.contact,
            as: 'contact'
          }]
        }]
      },
      {
        model: db.person_type,
        as: 'person_type'
      }]
    },
    {
      model: db.dog_breed,
      as: 'dog_breed'
    },
    {
      model: db.status,
      as: 'status'
    }]
  })
  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true' and parse the JSON yourself
  return JSON.parse(JSON.stringify(dog))
}

const getDogByIndexNumber = async (indexNumber) => {
  const dog = await db.dog.findOne({
    where: { index_number: indexNumber },
    include: [{
      model: db.registered_person,
      as: 'registered_person',
      include: [{
        model: db.person,
        as: 'person',
        include: [{
          model: db.person_address,
          as: 'addresses',
          include: [{
            model: db.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: db.country,
              as: 'country'
            }]
          }]
        },
        {
          model: db.person_contact,
          as: 'person_contacts',
          include: [{
            model: db.contact,
            as: 'contact'
          }]
        }]
      },
      {
        model: db.person_type,
        as: 'person_type'
      }]
    },
    {
      model: db.dog_breed,
      as: 'dog_breed'
    },
    {
      model: db.status,
      as: 'status'
    }]
  })
  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true' and parse the JSON yourself
  return JSON.parse(JSON.stringify(dog))
}

const getAllDogIds = async () => {
  return db.dog.findAll({ attributes: ['id'] })
}

module.exports = {
  getDogById,
  getAllDogIds,
  getDogByIndexNumber
}
