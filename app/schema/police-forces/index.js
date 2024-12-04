const Joi = require('joi')

const policeForceSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string()
})
const getPoliceForcesResponseSchema = Joi.object({
  policeForces: Joi.array().items(policeForceSchema)
})

const getPoliceForceResponseSchema = Joi.object({
  policeForce: policeForceSchema
})

module.exports = {
  getPoliceForcesResponseSchema,
  getPoliceForceResponseSchema,
  policeForceSchema
}
