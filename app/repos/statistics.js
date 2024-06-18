const sequelize = require('../config/db')
const constants = require('../constants/statuses')

const statusReverseOrder = [
  constants.statuses.Inactive,
  constants.statuses.Withdrawn,
  constants.statuses.InBreach,
  constants.statuses.Exempt,
  constants.statuses.Failed,
  constants.statuses.PreExempt,
  constants.statuses.InterimExempt
]

const constructStatusOrderBy = () => {
  return statusReverseOrder.map(st => `status='${st}'`).join(',')
}

const getCountsPerStatus = async () => {
  const counts = await sequelize.models.status.findAll({
    group: ['status.id', 'dogs.status_id'],
    attributes: ['dogs.status_id', 'status', [sequelize.fn('COALESCE', sequelize.fn('COUNT', sequelize.col('status_id')), 0), 'total']],
    include: [{
      attributes: ['status_id'],
      model: sequelize.models.dog,
      as: 'dogs',
      required: false
    }],
    where: {
      '$status.status_type$': 'STANDARD'
    },
    order: [sequelize.literal(constructStatusOrderBy())],
    raw: true,
    nest: true
  })

  return counts
}

module.exports = {
  getCountsPerStatus,
  constructStatusOrderBy
}
