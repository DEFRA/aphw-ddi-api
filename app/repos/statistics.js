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
  select db.breed, c.country, count(*) as total
  from dog_breed db,
     dog d,
     registered_person rp,
     person_address pa,
     address a,
     country c
  where rp.dog_id = d.id
  and d.dog_breed_id = db.id
  and rp.person_id = pa.person_id
  and pa.address_id = a.id
  and a.country_id = c.id
  group by db.breed, db.id, c.country, c.id
  order by db.id, c.id
  `

  const counts = await sequelize.query(querySql, { type: sequelize.QueryTypes.SELECT })
  return { counts, breeds }
}

module.exports = {
  getCountsPerStatus,
  constructStatusOrderBy,
  getCountsPerCountry
}
