const db = require('../data')

const getPersonById = async (id) => {
  return db.person.findByPk(id, {
    include: [{
      model: db.title,
      as: 'title'
    },
    {
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
    }],
    raw: true,
    nest: true
  })
}

const getPersonByRef = async (ref) => {
  return db.person.findOne({
    where: { person_reference: ref },
    include: [{
      model: db.title,
      as: 'title'
    },
    {
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
    }],
    raw: true,
    nest: true
  })
}

module.exports = {
  getPersonById,
  getPersonByRef
}
