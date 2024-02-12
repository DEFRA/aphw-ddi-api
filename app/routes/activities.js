const { getActivityList, getActivityById } = require('..//repos/activity')
const { getCallingUser } = require('../auth/get-user')

module.exports = [{
  method: 'GET',
  path: '/activities/{activityType}/{activitySource}',
  handler: async (request, h) => {
    const activityType = request.params.activityType
    const activitySource = request.params.activitySource

    const activities = await getActivityList(activityType, activitySource)

    return h.response({
      activities
    }).code(200)
  }
},
{
  method: 'GET',
  path: '/activity/{activityId}',
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
  handler: async (request, h) => {
    const payload = {
      ...request.payload,
      activityLabel: (await getActivityById(request.payload.activity)).label,
      user: getCallingUser(request)
    }

    console.log('payload', payload)

    return h.response({ result: 'ok' }).code(200)
  }
}]
