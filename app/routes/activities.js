const { getActivityList, getActivityById, createActivity, deleteActivity } = require('../repos/activity')
const { getCallingUser } = require('../auth/get-user')
const { sendActivityToAudit } = require('../messaging/send-audit')
const schema = require('../schema/activity/event')
const { createActivitySchema, createActivityResponseSchema } = require('../schema/activity/create')
const ServiceProvider = require('../service/config')
const { activities } = require('../constants/event/events')
const { getActivitySchema } = require('../schema/activity/response')

module.exports = [
  {
    method: 'GET',
    path: '/activities/{activityType}/{activitySource}',
    options: {
      tags: ['api'],
      response: {
        schema: getActivitySchema
      }
    },
    handler: async (request, h) => {
      const activityType = request.params.activityType
      const activitySource = request.params.activitySource

      const activities = await getActivityList(activityType, activitySource)

      const mapActivity = (activity) => ({
        id: activity.id,
        label: activity.label,
        activity_type_id: activity.activity_type_id,
        activity_source_id: activity.activity_source_id,
        display_order: activity.display_order,
        created_at: activity.created_at,
        updated_at: activity.updated_at,
        activity_event_id: activity.activity_event_id,
        activity_type: {
          id: activity.activity_type.id,
          name: activity.activity_type.name
        },
        activity_source: {
          id: activity.activity_source.id,
          name: activity.activity_source.name
        },
        activity_event: {
          id: activity.activity_event.id,
          target_primary_key: activity.activity_event.target_primary_key
        }
      })
      return h.response({
        activities: activities.map(mapActivity)
      }).code(200)
    }
  },
  {
    method: 'GET',
    path: '/activity/{activityId}',
    options: { tags: ['api'] },
    handler: async (request, h) => {
      const activityId = request.params.activityId

      const activity = await getActivityById(activityId)

      return h.response({
        activity
      }).code(200)
    }
  },
  {
    method: 'POST',
    path: '/activity',
    options: {
      tags: ['api'],
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
  },
  {
    method: 'POST',
    path: '/activities',
    options: {
      tags: ['api'],
      validate: {
        payload: createActivitySchema,
        failAction: (request, h, err) => {
          console.error(err)

          return h.response({ errors: err.details.map(e => e.message) }).code(400).takeover()
        }
      },
      response: {
        schema: createActivityResponseSchema
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
  }
]
