const db = require('../data')

const doDogsExistById = async (ids) => {
  return db.dog.findAll({
    attributes: ['id', 'index_number'],
    where: {
      orig_index_number: ids
    }
  })
}

module.exports = {
  doDogsExistById
}
