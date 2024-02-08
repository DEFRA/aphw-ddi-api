// const { activities } = require('../data')

module.exports = {
  method: 'GET',
  path: '/activities/{activityType}',
  handler: async (request, h) => {
    const activityType = request.params.activityType

    const activities = activityType === 'sent'
      ? [
          { text: 'Change of address form', value: 'change-of-address-form' },
          { text: 'Death of a dog form', value: 'death-of-dog' },
          { text: 'Witness statement', value: 'witness-statement' }
        ]
      : [
          { text: 'Police correspondence', value: 'police-correspondence' },
          { text: 'Witness statement', value: 'witness-statement' },
          { text: 'Judicial review', value: 'judicial-review' }
        ]

    // const activities = await activity.findAll({
    //  attributes: ['county']
    // })

    return h.response({
      activities
    }).code(200)
  }
}
