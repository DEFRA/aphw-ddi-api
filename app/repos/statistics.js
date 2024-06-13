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
  const counts = await sequelize.models.dog.findAll({
    group: ['status_id', 'status.id'],
    attributes: ['status_id', 'status.id', [sequelize.fn('COUNT', 'status_id'), 'total']],
    include: [{
      model: sequelize.models.status,
      as: 'status'
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
