const sequelize = require('../config/db')

const getActivityList = async (typeName, sourceName) => {
  try {
    const activities = await sequelize.models.activity.findAll({
      order: [[sequelize.col('activity.display_order'), 'ASC']],
      include: [{
        model: sequelize.models.activity_type,
        where: { name: typeName },
        as: 'activity_type'
      },
      {
        model: sequelize.models.activity_source,
        where: { name: sourceName },
        as: 'activity_source'
      }]
    })

    return activities
  } catch (e) {
    console.log(`Error retrieving activities for type ${typeName} and source ${sourceName}: ${e}`)
    throw e
  }
}

const getActivityById = async (id) => {
  try {
    const activities = await sequelize.models.activity.findOne({
      where: { id },
      include: [{
        model: sequelize.models.activity_type,
        as: 'activity_type'
      },
      {
        model: sequelize.models.activity_source,
        as: 'activity_source'
      }]
    })

    return activities
  } catch (e) {
    console.log(`Error retrieving activity for id ${id}: ${e}`)
    throw e
  }
}

module.exports = {
  getActivityList,
  getActivityById
}
