const sequelize = require('../config/db')
const { ACTIVITY } = require('../constants/event/audit-event-object-types')
const { DuplicateResourceError } = require('../errors/duplicate-record')
const { NotFoundError } = require('../errors/not-found')
const { sendCreateToAudit, sendDeleteToAudit } = require('../messaging/send-audit')

const getActivityList = async (typeName, sourceName) => {
  try {
    const activities = await sequelize.models.activity.findAll({
      order: [[sequelize.fn('lower', sequelize.col('activity.label')), 'ASC']],
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

    return activities
  } catch (e) {
    console.log(`Error retrieving activities for type ${typeName} and source ${sourceName}:`, e)
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
    console.log(`Error retrieving activity for id ${id}:`, e)
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
  const foundActivity = foundActivities?.length > 0 ? foundActivities[0] : null

  if (foundActivity !== null) {
    throw new DuplicateResourceError(`Activity with name ${activityData.label} already exists for type ${activityData.activityType} and source ${activityData.activitySource}`)
  }

  const activitySource = await sequelize.models.activity_source.findOne({
    where: { name: activityData.activitySource }
  })

  const activityType = await sequelize.models.activity_type.findOne({
    where: { name: activityData.activityType }
  })

  const activity = await sequelize.models.activity.create({
    label: activityData.label,
    activity_source_id: activitySource.id,
    activity_type_id: activityType.id,
    activity_event_id: activitySource.id,
    display_order: 10
  }, { transaction })

  await sendCreateToAudit(ACTIVITY, {
    id: activity.id,
    label: activity.label,
    activityType: activityData.activityType,
    activitySource: activityData.activitySource
  }, user)

  return {
    id: activity.id,
    label: activity.label,
    activityType: activityData.activityType,
    activitySource: activityData.activitySource
  }
}

const deleteActivity = async (activityId, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deleteActivity(activityId, user, t))
  }

  const foundActivity = await sequelize.models.activity.findOne({
    where: {
      id: activityId
    },
    transaction
  })

  if (foundActivity === null) {
    throw new NotFoundError(`Activity with id ${activityId} does not exist`)
  }

  await sequelize.models.activity.destroy({
    where: {
      id: activityId
    },
    transaction
  })

  await sendDeleteToAudit(ACTIVITY, foundActivity, user)
}

module.exports = {
  getActivityList,
  getActivityById,
  createActivity,
  deleteActivity
}
