const sequelize = require('../config/db')
const createRegistrationNumber = require('../lib/create-registration-number')

const createPeople = async (owners, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createPeople(owners, t))
  }

  const createdPeople = []

  try {
    for (const owner of owners) {
      const person = await sequelize.models.person.create({
        first_name: owner.firstName,
        last_name: owner.lastName,
        birth_date: owner.dateOfBirth,
        person_reference: createRegistrationNumber()
      }, { transaction })

      const address = await sequelize.models.address.create({
        address_line_1: owner.address.addressLine1,
        address_line_2: owner.address.addressLine2,
        town: owner.address.town,
        postcode: owner.address.postcode,
        country_id: 1
      }, { transaction })

      const createdAddress = await sequelize.models.address.findByPk(address.id, {
        include: [{
          attributes: ['country'],
          model: sequelize.models.country,
          as: 'country'
        }],
        raw: true,
        nest: true,
        transaction
      })

      await sequelize.models.person_address.create({
        person_id: person.id,
        address_id: address.id
      }, { transaction })

      createdPeople.push({ ...person.dataValues, address: createdAddress })
    }

    return createdPeople
  } catch (err) {
    console.error(`Error creating owner: ${err}`)
    throw err
  }
}

const getPersonByReference = async (reference, transaction) => {
  try {
    const person = await sequelize.models.person.findOne({
      where: {
        person_reference: reference
      },
      order: [
        [{ model: sequelize.models.person_address, as: 'addresses' }, 'id', 'DESC']
      ],
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
      }],
      transaction
    })

    return person
  } catch (err) {
    console.error(`Error getting person by reference: ${err}`)
    throw err
  }
}

const getPersonAndDogsByReference = async (reference, transaction) => {
  try {
    const person = await sequelize.models.registered_person.findAll({
      include: [{
        model: sequelize.models.person,
        where: { person_reference: reference },
        as: 'person',
        include: [{
          model: sequelize.models.person_address,
          as: 'addresses',
          order: [
            [{ model: sequelize.models.person_address, as: 'addresses' }, 'id', 'DESC']
          ],
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
        model: sequelize.models.dog,
        as: 'dog',
        include: [{
          model: sequelize.models.dog_breed,
          as: 'dog_breed'
        },
        {
          model: sequelize.models.status,
          as: 'status'
        }]
      }],
      transaction
    })

    return person
  } catch (err) {
    console.error(`Error getting person and dogs by reference: ${err}`)
    throw err
  }
}

module.exports = {
  createPeople,
  getPersonByReference,
  getPersonAndDogsByReference
}
