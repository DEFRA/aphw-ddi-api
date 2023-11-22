const db = require('../data')

const getPersonById = async (id) => {
  return db.person.findByPk(id, {
    include: [{
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
  getPersonById
}
