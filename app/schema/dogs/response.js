const Joi = require('joi')

const dogMicrochip = Joi.object({
  id: Joi.number(),
  dog_id: Joi.number(),
  microchip_id: Joi.number(),
  microchip: Joi.object({
    id: Joi.number(),
    microchip_number: Joi.string()
  })
})

const updateDogSchema = Joi.object({
  id: Joi.number(),
  dog_reference: Joi.string(),
  index_number: Joi.string(),
  dog_breed_id: Joi.number(),
  status_id: Joi.number(),
  name: Joi.string().allow('').allow(null),
  registered_person: Joi.array().items(Joi.object({
    id: Joi.number(),
    person_id: Joi.number(),
    dog_id: Joi.number(),
    person_type_id: Joi.number(),
    person: Joi.object({
      id: Joi.number(),
      first_name: Joi.string(),
      last_name: Joi.string(),
      person_reference: Joi.string(),
      birth_date: Joi.date().allow(null),
      organisation_id: Joi.number().allow(null),
      addresses: Joi.array().items(Joi.object({
        id: Joi.number(),
        person_id: Joi.number(),
        address_id: Joi.number(),
        address: Joi.object({
          id: Joi.number(),
          address_line_1: Joi.string(),
          address_line_2: Joi.string().allow(null).allow(''),
          town: Joi.string(),
          postcode: Joi.string(),
          county: Joi.string().allow(null).allow(''),
          country_id: Joi.number(),
          country: Joi.object({
            id: Joi.number(),
            country: Joi.string()
          })
        })
      })),
      person_contacts: Joi.array()
    }),
    person_type: Joi.object({
      id: Joi.number(),
      person_type: Joi.string()
    })
  })),
  dog_breed: Joi.object({
    id: Joi.number(),
    breed: Joi.string(),
    active: Joi.boolean(),
    display_order: Joi.number()
  }),
  dog_microchips: Joi.array().items(dogMicrochip),
  status: Joi.object({
    id: Joi.number(),
    status: Joi.string(),
    status_type: Joi.string()
  }),
  dog_breaches: Joi.array().items(Joi.string())
}).unknown()

const importDogSchema = Joi.string().allow('ok')

module.exports = {
  importDogSchema,
  updateDogSchema
}
