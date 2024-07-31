const Joi = require('joi')

const dogsQueryParamsSchema = Joi.object({
  forPurging: Joi.boolean().optional(),
  sortKey: Joi.string().optional(),
  sortOrder: Joi.string().optional().allow('ASC', 'DESC'),
  statuses: Joi.string().optional().allow('Exempt', 'Failed', 'Inactive', 'Interim exempt', 'In breach', 'Pre-exempt', 'Withdrawn'),
  today: Joi.date().optional()
})

const getDogResponseSchema = Joi.object({
  dog: Joi.object({
    id: Joi.number(),
    indexNumber: Joi.string(),
    name: Joi.string().allow(null).allow(''),
    breed: Joi.string(),
    colour: Joi.string().allow(null).allow(''),
    sex: Joi.string().allow(null).allow(''),
    dateOfBirth: Joi.date().allow(null),
    dateOfDeath: Joi.date().allow(null),
    tattoo: Joi.string().allow(null).allow(''),
    microchipNumber: Joi.date().allow(null),
    microchipNumber2: Joi.date().allow(null),
    dateExported: Joi.date().allow(null),
    dateStolen: Joi.date().allow(null),
    dateUntraceable: Joi.date().allow(null),
    breaches: Joi.array().items(Joi.string())
  })
})

module.exports = {
  dogsQueryParamsSchema,
  getDogResponseSchema
}
