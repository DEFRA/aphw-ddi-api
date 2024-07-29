const { getActivityList, getActivityById, createActivity, deleteActivity } = require('../repos/activity')
const { getCallingUser } = require('../auth/get-user')
const { sendActivityToAudit } = require('../messaging/send-audit')
const schema = require('../schema/activity/event')
const { createActivitySchema, createActivityResponseSchema } = require('../schema/activity/create')
const ServiceProvider = require('../service/config')
const { activities } = require('../constants/event/events')
const { getActivitiesSchema, getActivitySchema } = require('../schema/activity/response')
const { conflictSchema } = require('../schema/common/response/conflict')
const { successResponseSchema } = require('../schema/common/response/ok')
const { mapActivityDaoToActivityDto } = require('../dto/mappers/activity')

module.exports = [
  {
    method: 'GET',
    path: '/activities/{activityType}/{activitySource}',
    options: {
      tags: ['api'],
      notes: ['Returns list of usable activities filtered by activityType and activitySource'],
      response: {
        schema: getActivitiesSchema
      }
    },
    handler: async (request, h) => {
      const activityType = request.params.activityType
      const activitySource = request.params.activitySource

      const activities = await getActivityList(activityType, activitySource)

      return h.response({
        activities: activities.map(mapActivityDaoToActivityDto)
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/activities',
    options: {
      tags: ['api'],
      notes: ['Creates a new custom activity type'],
      validate: {
        payload: createActivitySchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        status: {
          200: createActivityResponseSchema,
          409: conflictSchema
        }
      },
      handler: async (request, h) => {
        const activity = await createActivity(request.payload, getCallingUser(request))

        return h.response({
          id: activity.id,
          label: activity.label,
          activityType: activity.activityType,
          activitySource: activity.activitySource
        }).code(201)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/activities/{activityId}',
    options: {
      tags: ['api'],
      notes: ['Deletes an activity type by id'],
      response: {
        status: {
          204: undefined
        }
      }
    },
    handler: async (request, h) => {
      const activityId = request.params.activityId
      await deleteActivity(activityId, getCallingUser(request))

      return h.response().code(204)
    }
  },
  {
    method: 'GET',
    path: '/activity/{activityId}',
    options: {
      tags: ['api'],
      notes: ['Returns a single activity type by id'],
      response: {
        schema: getActivitySchema
      }
    },
    handler: async (request, h) => {
      const activityId = request.params.activityId

      const activity = await getActivityById(activityId)

      return h.response({
        activity: mapActivityDaoToActivityDto(activity)
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/activity',
    options: {
      tags: ['api'],
      notes: ['On successful submission publishes an activity event of requested type'],
      response: {
        schema: successResponseSchema
      },
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const payload = {
          ...request.payload,
          activityLabel: (await getActivityById(request.payload.activity)).label
        }

        if (payload.activityLabel === activities.applicationPackSent && payload.activityType === 'sent') {
          await ServiceProvider.getCdoService().sendApplicationPack(payload.pk, payload.activityDate, getCallingUser(request))
        } else if (payload.activityLabel === activities.form2Sent && payload.activityType === 'sent') {
          await ServiceProvider.getCdoService().sendForm2(payload.pk, payload.activityDate, getCallingUser(request))
        } else {
          await sendActivityToAudit(payload, getCallingUser(request))
        }

        return h.response({ result: 'ok' }).code(200)
      }
    }
  }

]
