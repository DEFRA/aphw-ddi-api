const sequelize = require('../config/db')
const { ACTIVITY } = require('../constants/event/audit-event-object-types')
const activitySource = require('../data/models/activity-source')

const getActivityList = async (typeName, sourceName) => {
  try {
    const activities = await sequelize.models.activity.findAll({
      order: [[sequelize.col('activity.label'), 'ASC']],
      include: [{
        model: sequelize.models.activity_type,
        where: { name: typeName },
        as: 'activity_type'
      },
      {
        model: sequelize.models.activity_source,
        where: { name: sourceName },
        as: 'activity_source'
      },
      {
        model: sequelize.models.activity_event,
        as: 'activity_event'
      }]
    })

    console.log('list', activities)
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
      },
      {
        model: sequelize.models.activity_event,
        as: 'activity_event'
      }]
    })

    return activities
  } catch (e) {
    console.log(`Error retrieving activity for id ${id}: ${e}`)
    throw e
  }
}

/**
 * @typedef ActivityCreatePayload
 * @property {string} label
 * @property {string} activityType
 * @property {string} activitySource
 */
/**
 * @param {ActivityCreatePayload} activityData
 * @param user
 * @param [transaction]
 * @returns {Promise<*|undefined>}
 */
const createActivity = async (activityData, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createActivity(activityData, user, t))
  }

  const activityTypes = await getActivityList(activityData.activityType, activityData.activitySource)

  const foundActivities = activityTypes.filter(x => x.label.toLowerCase() === activityData.label.toLowerCase())
  const foundActivity = foundActivities ? foundActivities[0] : null

  if (foundActivity !== null) {
    throw new DuplicateResourceError(`Activity with name ${activityData.name} already exists for type ${activityData.activityType} and source ${activityData.activitySource}`)
  }

  const activity = await sequelize.models.activity.create({
      label: activityData.label
    }, { transaction })

  await sendCreateToAudit(ACTIVITY, {
    id: activity.id,
    label: activity.name,
    activityType: activityData.activityType,
    activitySource: activityData.activitySource
  }, user)

  return activity
}

const deleteActivity = async (activityId, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteActivity(activityId, user, t))
  }
  const foundActivity = await sequelize.models.activity.findOne({
    where: {
      id: activityId
    }
  })

  if (foundActivity === null) {
    throw new NotFoundError(`Activity with id ${activityId} does not exist`)
  }

  const destroyedActivity = await sequelize.models.activity.destroy({
    where: {
      id: activityId
    },
    transaction
  })

  await sendDeleteToAudit(ACTIVITY, foundActivity, user)

  return destroyedActivity
}

module.exports = {
  getActivityList,
  getActivityById,
  createActivity,
  deleteActivity
}
