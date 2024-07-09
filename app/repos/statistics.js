const sequelize = require('../config/db')
const constants = require('../constants/statuses')
const { getBreeds } = require('./dogs')

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

const getCountsPerCountry = async () => {
  const breeds = await getBreeds()

  const querySql = `
  SELECT db.breed, c.country, count(*) as total
  FROM dog_breed db,
      dog d,
      registered_person rp,
      (SELECT pa.person_id, max(pa.address_id) as pa_address_id FROM person_address pa GROUP BY pa.person_id) pa_max,
      address a,
      country c,
      status s
  WHERE rp.dog_id = d.id
  AND d.dog_breed_id = db.id
  AND rp.person_id = pa_max.person_id
  AND pa_max.pa_address_id = a.id
  AND a.country_id = c.id
  AND d.status_id = s.id
  AND d.deleted_at IS NULL
  AND rp.deleted_at IS NULL
  AND s.status IN ('In breach', 'Exempt')
  GROUP BY db.breed, db.id, c.country, c.id
  ORDER BY db.id, c.id
  `

  const counts = await sequelize.query(querySql, { type: sequelize.QueryTypes.SELECT })
  return { counts, breeds }
}

module.exports = {
  getCountsPerStatus,
  constructStatusOrderBy,
  getCountsPerCountry
}
