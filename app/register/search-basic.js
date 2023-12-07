const sequelize = require('../config/db')
const { Op } = require('sequelize')

const search = async (type, terms) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = terms.replaceAll('  ', ' ').split(' ')
  const termsQuery = termsArray.join(' & ')
  const results = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
    /*
    include: [{
      model: sequelize.models.dog,
      required: true
    }]
    */
  })

  console.log('results', results)
  const mappedResults = results.map(x => {
    return { indexNumber: x.reference_number }
  })

  return mappedResults
}

module.exports = {
  search
}
