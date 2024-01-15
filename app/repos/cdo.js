const sequelize = require('../config/db')
const { createPeople } = require('./people')
const { createDogs } = require('./dogs')
const { addToSearchIndex } = require('./search')

const createCdo = async (data, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => createCdo(data, t))
  }

  try {
    const owners = await createPeople([data.owner], transaction)
    const dogs = await createDogs(data.dogs, owners, data.enforcementDetails, transaction)

    for (const owner of owners) {
      for (const dog of dogs) {
        await addToSearchIndex(owner, dog.id, transaction)
      }
    }

    return {
      owner: owners[0],
      dogs
    }
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

const getCdo = async (indexNumber) => {
  const cdo = await sequelize.models.dog.findAll({
    where: { index_number: indexNumber },
    order: [[sequelize.col('registered_person.person.addresses.address.id'), 'DESC'],
      [sequelize.col('dog_microchips.microchip.id'), 'ASC']],
    include: [{
      model: sequelize.models.registered_person,
      as: 'registered_person',
      include: [{
        model: sequelize.models.person,
        as: 'person',
        include: [{
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [{
            model: sequelize.models.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: sequelize.models.country,
              as: 'country'
            }]
          }]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
          include: [{
            model: sequelize.models.contact,
            as: 'contact',
            include: [{
              model: sequelize.models.contact_type,
              as: 'contact_type'
            }]
          }]
        }]
      },
      {
        model: sequelize.models.person_type,
        as: 'person_type'
      }]
    },
    {
      model: sequelize.models.dog_breed,
      as: 'dog_breed'
    },
    {
      model: sequelize.models.status,
      as: 'status'
    },
    {
      model: sequelize.models.registration,
      as: 'registration',
      include: [{
        model: sequelize.models.police_force,
        as: 'police_force'
      },
      {
        model: sequelize.models.court,
        as: 'court'
      },
      {
        model: sequelize.models.exemption_order,
        as: 'exemption_order'
      }]
    },
    {
      model: sequelize.models.insurance,
      as: 'insurance',
      include: {
        model: sequelize.models.insurance_company,
        as: 'company'
      }
    },
    {
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      include: [{
        model: sequelize.models.microchip,
        as: 'microchip'
      }]
    }]
  })

  return cdo?.length > 0 ? cdo[0] : null
}

const getAllCdos = async () => {
  const cdos = await sequelize.models.dog.findAll({
    order: [[sequelize.col('registered_person.person.addresses.address.id'), 'DESC'],
      [sequelize.col('dog_microchips.microchip.id'), 'ASC']],
    include: [{
      model: sequelize.models.registered_person,
      as: 'registered_person',
      include: [{
        model: sequelize.models.person,
        as: 'person',
        include: [{
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [{
            model: sequelize.models.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: sequelize.models.country,
              as: 'country'
            }]
          }]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
          include: [{
            model: sequelize.models.contact,
            as: 'contact',
            include: [{
              model: sequelize.models.contact_type,
              as: 'contact_type'
            }]
          }]
        }]
      },
      {
        model: sequelize.models.person_type,
        as: 'person_type'
      }]
    },
    {
      model: sequelize.models.dog_breed,
      as: 'dog_breed'
    },
    {
      model: sequelize.models.status,
      as: 'status'
    },
    {
      model: sequelize.models.registration,
      as: 'registration',
      include: [{
        model: sequelize.models.police_force,
        as: 'police_force'
      },
      {
        model: sequelize.models.court,
        as: 'court'
      }]
    },
    {
      model: sequelize.models.insurance,
      as: 'insurance',
      include: {
        model: sequelize.models.insurance_company,
        as: 'company'
      }
    },
    {
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      include: [{
        model: sequelize.models.microchip,
        as: 'microchip'
      }]
    }]
  })

  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true'
  return cdos
}

module.exports = {
  createCdo,
  getCdo,
  getAllCdos
}
