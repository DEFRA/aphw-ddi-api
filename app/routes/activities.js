// const { activities } = require('../data')

module.exports = [{
  method: 'GET',
  path: '/activities/{activityType}',
  handler: async (request, h) => {
    const activityType = request.params.activityType

    const activities = activityType === 'sent'
      ? [
          { text: 'Change of address form', value: '1' },
          { text: 'Death of a dog form', value: '2' },
          { text: 'Witness statement', value: '3' }
        ]
      : [
          { text: 'Police correspondence', value: '21' },
          { text: 'Witness statement', value: '22' },
          { text: 'Judicial review', value: '23' }
        ]

    // const activities = await activity.findAll({
    //  attributes: ['county']
    // })

    return h.response({
      activities
    }).code(200)
  }
},
{
  method: 'GET',
  path: '/activity/{activityId}',
  handler: async (request, h) => {
    const id = request.params.activityId

    const activities = [
      { text: 'Change of address form', value: '1' },
      { text: 'Death of a dog form', value: '2' },
      { text: 'Witness statement', value: '3' },
      { text: 'Police correspondence', value: '21' },
      { text: 'Witness statement', value: '22' },
      { text: 'Judicial review', value: '23' }
    ]

    const activity = activities.filter(x => x.value === id)
    // const activities = await activity.findAll({
    //  attributes: ['county']
    // })

    return h.response({
      activity
    }).code(200)
  }
}]
