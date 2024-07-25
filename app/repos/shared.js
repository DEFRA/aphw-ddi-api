const sequelize = require('../config/db')
const { Op } = require('sequelize')

/**
 * @param {string} name
 * @param {string} colName
 * @return {{where: {}}}
 */
const findQueryV1 = (name, colName) => ({
  where: {
    [colName]: {
      [Op.iLike]: `%${name}%`
    }
  }
})

/**
 * @param {string} name
 * @param {string} colName
 * @return {{where: {}}}
 */
const findQueryV2 = (name, colName) => ({
  where: sequelize.where(
    sequelize.fn('lower', sequelize.col(colName)),
    sequelize.fn('lower', name)
  )
})

/**
 * @type {function(string, string): {where: {}}}
 */
const getFindQuery = findQueryV1

/**
 * @param {Model<any, TModelAttributes>} paranoidModel
 * @param {Record<string, any>} update
 * @param transaction
 * @return {Promise<Model<any, TModelAttributes>>}
 */
const updateParanoid = async (paranoidModel, update, transaction) => {
  await paranoidModel.restore({ transaction })

  for (const key of Object.keys(update)) {
    paranoidModel[key] = update[key]
  }
  await paranoidModel.save({ transaction })

  return paranoidModel
}

module.exports = {
  getFindQuery,
  findQueryV2,
  findQueryV1,
  updateParanoid
}
