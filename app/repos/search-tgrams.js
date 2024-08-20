const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { trigramSearchFields } = require('../constants/search')
const { fieldNotNullOrEmpty, getFieldValue } = require('../lib/field-helpers')

const insertTrigram = async (dogId, personId, fieldValue) => {
  if (fieldValue && fieldValue !== '') {
    await sequelize.models.search_tgram.create({
      dog_id: dogId,
      person_id: personId,
      match_text: `${fieldValue}`.replace(' ', '').toLowerCase()
    })
  }
}

const insertTrigramsPerDog = async (row) => {
  for (let fieldNum = 0; fieldNum < trigramSearchFields.length; fieldNum++) {
    const field = trigramSearchFields[fieldNum]
    if (field.source === 'dog') {
      const fieldValue = getFieldValue(row.json, field.fieldName)
      if (fieldNotNullOrEmpty(fieldValue)) {
        await insertTrigram(row.dog_id, null, fieldValue)
      }
    }
  }
}

const insertTrigramsPerPerson = async (row) => {
  for (let fieldNum = 0; fieldNum < trigramSearchFields.length; fieldNum++) {
    const field = trigramSearchFields[fieldNum]
    if (field.source === 'person') {
      const fieldValue = getFieldValue(row.json, field.fieldName)
      if (fieldNotNullOrEmpty(fieldValue)) {
        await insertTrigram(null, row.person_id, fieldValue)
      }
    }
  }
}

const updateTrigramsPerDogOrPerson = async (id, type, row, transaction) => {
  if (type === 'dog') {
    await sequelize.models.search_tgram.destroy({ where: { dog_id: id }, force: true }, { transaction })
    await insertTrigramsPerDog(row)
  } else if (type === 'person') {
    await sequelize.models.search_tgram.destroy({ where: { person_id: id }, force: true }, { transaction })
    await insertTrigramsPerPerson(row)
  }
}

const populateTrigrams = async () => {
  const searchRows = await sequelize.models.search_index.findAll()

  await sequelize.models.search_tgram.truncate()

  for (let rowNum = 0; rowNum < searchRows.length; rowNum++) {
    const searchRow = searchRows[rowNum]
    await insertTrigramsPerDog(searchRow)
    await insertTrigramsPerPerson(searchRow)
  }
}

const trigramTermQuery = async (term, threshold) => {
  return await sequelize.models.search_tgram.findAll({
    attributes: { include: [[sequelize.fn('similarity', sequelize.col('match_text'), term), 'similarity_score']] },
    where: [sequelize.where(sequelize.fn('similarity', sequelize.col('match_text'), term),
      { [Op.gt]: threshold }
    ),
    {}
    ]
  })
}

const trigramSearch = async (terms, threshold) => {
  const uniquePersons = []
  const uniqueDogs = []

  for (let termNum = 0; termNum < terms.length; termNum++) {
    const term = terms[termNum]

    const results = await trigramTermQuery(term, threshold)

    results.forEach(res => {
      if (res.person_id && !uniquePersons.includes(res.person_id)) {
        uniquePersons.push(res.person_id)
      }
      if (res.dog_id && !uniqueDogs.includes(res.dog_id)) {
        uniqueDogs.push(res.dog_id)
      }
    })
  }
  return { uniquePersons, uniqueDogs }
}

module.exports = {
  populateTrigrams,
  trigramSearch,
  insertTrigramsPerDog,
  insertTrigramsPerPerson,
  updateTrigramsPerDogOrPerson
}
