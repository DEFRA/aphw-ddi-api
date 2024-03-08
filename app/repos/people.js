const sequelize = require('../config/db')
const { deepClone } = require('../lib/deep-clone')
const createRegistrationNumber = require('../lib/create-registration-number')
const { getCountry, getContactType } = require('../lookups')
const { updateSearchIndexPerson } = require('./search')
const { sendUpdateToAudit } = require('../messaging/send-audit')
const { PERSON } = require('../constants/event/audit-event-object-types')
const { personDto } = require('../dto/person')

/**
 * @typedef CountryDao
 * @property {number} [id]
 * @property {string} country
 */
/**
 * @typedef AddressDao
 * @property {number} id
 * @property {string} address_line_1
 * @property {string|null} address_line_2
 * @property {string} town
 * @property {string} postcode
 * @property {string|null} county
 * @property {number} country_id
 * @property {CountryDao} country
 */
/**
 * @typedef CreatedPersonDao
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} birth_date
 * @property {string} person_reference
 * @property {AddressDao} address
 */

/**
 * @param owners
 * @param transaction
 * @returns {Promise<CreatedPersonDao[]>}
 */
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
        birth_date: owner.dateOfBirth ?? owner.birthDate,
        person_reference: createRegistrationNumber()
      }, { transaction })

      const country = await getCountry(owner.address.country)

      const address = await sequelize.models.address.create({
        address_line_1: owner.address.addressLine1,
        address_line_2: owner.address.addressLine2,
        town: owner.address.town,
        postcode: owner.address.postcode,
        country_id: country?.id ?? 1
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

      if (owner.email) {
        await createContact(person, 'Email', owner.email, transaction)
      }

      if (owner.primaryTelephone) {
        await createContact(person, 'Phone', owner.primaryTelephone, transaction)
      }

      if (owner.secondaryTelephone) {
        await createContact(person, 'SecondaryPhone', owner.secondaryTelephone, transaction)
      }

      createdPeople.push({ ...person.dataValues, address: createdAddress })
    }

    return createdPeople
  } catch (err) {
    console.error(`Error creating owner: ${err}`)
    throw err
  }
}
/**
 * @typedef PersonAddressDao
 * @property {number} id
 * @property {number} person_id
 * @property {number} address_id
 * @property {AddressDao} address
 */
/**
 * @typedef PersonDao
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} person_reference
 * @property {string} birth_date
 * @property {PersonAddressDao[]} addresses
 * @property {unknown[]} person_contacts
 */

/**
 * @param {string} reference
 * @param [transaction]
 * @returns {Promise<PersonDao|null>}
 */
const getPersonByReference = async (reference, transaction) => {
  try {
    const person = await sequelize.models.person.findAll({
      order: [[sequelize.col('addresses.address.id'), 'DESC']],
      where: { person_reference: reference },
      include: [
        {
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [
            {
              model: sequelize.models.address,
              as: 'address',
              include: [
                {
                  attribute: ['country'],
                  model: sequelize.models.country,
                  as: 'country'
                }
              ]
            }
          ]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          separate: true,
          include: [
            {
              model: sequelize.models.contact,
              as: 'contact',
              include: [
                {
                  model: sequelize.models.contact_type,
                  as: 'contact_type'
                }
              ]
            }
          ]
        }
      ],
      transaction
    })

    return person?.length > 0 ? person[0] : null
  } catch (err) {
    console.error(`Error getting person by reference: ${err}`)
    throw err
  }
}

const getOwnerOfDog = async (indexNumber) => {
  try {
    const person = await sequelize.models.registered_person.findOne({
      include: [{
        model: sequelize.models.person,
        as: 'person'
      },
      {
        model: sequelize.models.dog,
        where: { index_number: indexNumber },
        as: 'dog'
      }]
    })

    return person
  } catch (err) {
    console.error(`Error getting owner of dog ${indexNumber}: ${err}`)
    throw err
  }
}

const updatePerson = async (person, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => updatePerson(person, user, t))
  }

  try {
    const existing = await getPersonByReference(person.personReference, transaction)

    if (!existing) {
      const error = new Error('Person not found')

      error.type = 'NOT_FOUND'

      throw error
    }

    const preChangedPersonDto = deepClone(personDto(existing, true))

    await sequelize.models.person.update({
      first_name: person.firstName,
      last_name: person.lastName,
      birth_date: person.dateOfBirth
    }, {
      where: {
        id: existing.id
      },
      transaction
    })

    const existingAddress = existing.addresses[0].address

    if (existingAddress.address_line_1 !== person.address.addressLine1 ||
        existingAddress.address_line_2 !== person.address.addressLine2 ||
        existingAddress.town !== person.address.town ||
        existingAddress.postcode !== person.address.postcode ||
        existingAddress.country.country !== person.address.country) {
      const country = await getCountry(person.address.country)

      const address = await sequelize.models.address.create({
        address_line_1: person.address.addressLine1,
        address_line_2: person.address.addressLine2,
        town: person.address.town,
        postcode: person.address.postcode,
        country_id: country?.id ?? 1
      }, { transaction })

      await sequelize.models.person_address.create({
        person_id: existing.id,
        address_id: address.id
      }, { transaction })
    }

    await updateContact(existing, 'Email', person.email, transaction)
    await updateContact(existing, 'Phone', person.primaryTelephone, transaction)
    await updateContact(existing, 'SecondaryPhone', person.secondaryTelephone, transaction)

    const updatedPerson = await getPersonByReference(person.personReference, transaction)

    person.id = updatedPerson.id
    await updateSearchIndexPerson(person, transaction)

    await sendUpdateToAudit(PERSON, preChangedPersonDto, personDto(updatedPerson, true), user)

    return updatedPerson
  } catch (err) {
    console.error(`Error updating person: ${err}`)
    throw err
  }
}

const getPersonAndDogsByReference = async (reference, transaction) => {
  try {
    const person = await sequelize.models.registered_person.findAll({
      order: [[sequelize.col('person.addresses.address.id'), 'DESC'],
        [sequelize.col('dog.dog_microchips.microchip.id'), 'ASC']],
      include: [{
        model: sequelize.models.person,
        where: { person_reference: reference },
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
          separate: true,
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
        },
        {
          model: sequelize.models.dog_microchip,
          as: 'dog_microchips',
          include: [{
            model: sequelize.models.microchip,
            as: 'microchip'
          }]
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

const createContact = async (person, type, contact, transaction) => {
  const contactType = await getContactType(type)

  const email = await sequelize.models.contact.create({
    contact_type_id: contactType.id,
    contact
  }, { transaction })

  await sequelize.models.person_contact.create({
    person_id: person.id,
    contact_id: email.id
  }, { transaction })
}

const updateContact = async (existingPerson, type, contact, transaction) => {
  const existingContacts = existingPerson.person_contacts.filter(contact => contact.contact.contact_type.contact_type === type)

  existingContacts.sort((a, b) => b.id - a.id)

  const existingContact = existingContacts.length ? existingContacts[0].contact.contact : undefined

  if (existingContact !== contact) {
    await createContact(existingPerson, type, contact, transaction)
  }
}

module.exports = {
  createPeople,
  getPersonByReference,
  getPersonAndDogsByReference,
  updatePerson,
  getOwnerOfDog
}
