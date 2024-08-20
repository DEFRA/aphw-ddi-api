const sequelize = require('../config/db')
const { deepClone } = require('../lib/deep-clone')
const createRegistrationNumber = require('../lib/create-registration-number')
const { getCountry, getContactType } = require('../lookups')
const { updateSearchIndexPerson } = require('./search-index')
const { sendUpdateToAudit, sendDeleteToAudit, sendPermanentDeleteToAudit } = require('../messaging/send-audit')
const { PERSON } = require('../constants/event/audit-event-object-types')
const { personDto } = require('../dto/person')
const { personRelationship } = require('./relationships/person')

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
 *
 * @param {string} personReference
 * @param transaction
 * @returns {Promise<boolean>}
 */
const pkExists = async (personReference, transaction) => {
  const count = await sequelize.models.person.count({ where: { person_reference: personReference } }, { transaction })

  return count > 0
}
/**
 * @param owners
 * @param {Person[]} owners
 * @param  [transaction]
 * @returns {Promise<CreatedPersonDao[]>}
 *
 */
const createPeople = async (owners, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => createPeople(owners, t))
  }

  const createdPeople = []

  try {
    for (const owner of owners) {
      const createProperties = {
        first_name: owner.firstName,
        last_name: owner.lastName,
        birth_date: owner.dateOfBirth ?? owner.birthDate,
        person_reference: ''
      }

      let pkAlreadyExists = true

      while (pkAlreadyExists) {
        const personReference = createRegistrationNumber()
        createProperties.person_reference = personReference
        pkAlreadyExists = await pkExists(personReference, transaction)
      }

      const person = await sequelize.models.person.create(createProperties, { transaction })

      const country = await getCountry(owner.address.country)

      const address = await sequelize.models.address.create({
        address_line_1: owner.address.addressLine1,
        address_line_2: owner.address.addressLine2,
        town: owner.address.town,
        postcode: owner.address.postcode,
        county: owner.address.county,
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
    console.error('Error creating owner:', err)
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
 * @typedef SummmaryPersonDao
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} person_reference
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
      include: personRelationship(sequelize),
      transaction
    })

    return person?.length > 0 ? person[0] : null
  } catch (err) {
    console.error('Error getting person by reference:', err)
    throw err
  }
}

const getOwnerOfDog = async (indexNumber) => {
  try {
    return await sequelize.models.registered_person.findOne({
      include: [{
        model: sequelize.models.person,
        as: 'person',
        include: personRelationship(sequelize)
      },
      {
        model: sequelize.models.dog,
        where: { index_number: indexNumber },
        as: 'dog'
      }]
    })
  } catch (err) {
    console.error(`Error getting owner of dog ${indexNumber}:`, err)
    throw err
  }
}

const updatePerson = async (person, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => updatePerson(person, user, t))
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
    person.organisationName = updatedPerson.organisation?.organisation_name
    await updateSearchIndexPerson(person, transaction)

    await sendUpdateToAudit(PERSON, preChangedPersonDto, personDto(updatedPerson, true), user)

    return updatedPerson
  } catch (err) {
    console.error('Error updating person:', err)
    throw err
  }
}

/**
 *
 * @param id
 * @param {{
 *   dateOfBirth: Date
 * }} personFields
 * @param user
 * @param [transaction]
 * @returns {Promise<PersonDao>}
 */
const updatePersonFields = async (id, personFields, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => updatePersonFields(id, personFields, user, t))
  }

  const person = await sequelize.models.person.findByPk(id, { transaction })

  /**
   * @type {Partial<PersonDao>}
   */
  const personDao = Object.keys(personFields).reduce((personDao, personKey) => {
    if (personKey === 'dateOfBirth') {
      personDao.birth_date = personFields[personKey]
    }
    return personDao
  }, {})

  if (Object.values(personDao).length) {
    await person.update(personDao, { transaction })
    await person.save({
      transaction
    })
    await person.reload({
      transaction
    })
  }

  return person
}
/**
 * @typedef RegisteredPerson
 * @property {number} id
 * @property {number} person_id
 * @property {number} dog_id
 * @property {number} person_type_id
 * @property {DogDao} dog
 */
/**
 * @typedef {unknown} PersonContact
 */
/**
 * @typedef PersonWithRegisteredPeople
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} person_reference
 * @property {string} birth_date
 * @property {PersonAddressDao[]} addresses
 * @property {PersonContact[]} person_contacts
 * @property {RegisteredPerson[]} registered_people
 */

/**
 * @typedef PersonAndDogsByIndexDao
 * @property {number} id
 * @property {number} person_id
 * @property {number} dog_id
 * @property {number} person_type_id
 * @property {DogDao} dog
 * @property {PersonWithRegisteredPeople} person
 */

/**
 * @param {string} indexNumber
 * @param [transaction]
 * @return {Promise<PersonAndDogsByIndexDao>}
 */
const getPersonAndDogsByIndex = async (indexNumber, transaction) => {
  try {
    const [owner] = await sequelize.models.registered_person.findAll({
      order: [[sequelize.col('person.addresses.address.id'), 'DESC']],
      include: [
        {
          model: sequelize.models.person,
          as: 'person',
          include: [
            ...personRelationship(sequelize),
            {
              model: sequelize.models.registered_person,
              as: 'registered_people',
              include: [
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
                  }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: sequelize.models.dog,
          where: { index_number: indexNumber },
          as: 'dog'
        }
      ],
      transaction
    })
    return owner
  } catch (err) {
    console.error(`Error getting owner of dog ${indexNumber}:`, err)
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
        include: personRelationship(sequelize)
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

    if (!person?.length) {
      // Owner has no dogs
      return [{
        dog: null,
        person: await getPersonByReference(reference, transaction)
      }]
    }

    return person
  } catch (err) {
    console.error('Error getting person and dogs by reference:', err)
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

const deletePerson = async (reference, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => deletePerson(reference, user, t))
  }

  const [personWithRelationships] = await sequelize.models.person.findAll({
    order: [[sequelize.col('addresses.address.id'), 'DESC']],
    where: { person_reference: reference },
    include: personRelationship(sequelize, false),
    transaction
  })

  const person = await sequelize.models.person.findOne({ where: { person_reference: reference } })
  await person.destroy()

  for (const personAddress of personWithRelationships.addresses) {
    await personAddress.address.destroy()
    await personAddress.destroy()
  }

  for (const personContact of personWithRelationships.person_contacts) {
    await personContact.contact.destroy()
    await personContact.destroy()
  }

  await sequelize.models.search_index.destroy({ where: { person_id: person.id } })

  await sendDeleteToAudit(PERSON, personWithRelationships, user)
}

const purgePersonByReferenceNumber = async (reference, user, transaction) => {
  if (!transaction) {
    return await sequelize.transaction(async (t) => purgePersonByReferenceNumber(reference, user, t))
  }

  const [person] = await sequelize.models.person.findAll({
    order: [[sequelize.col('addresses.address.id'), 'DESC']],
    where: { person_reference: reference },
    paranoid: false,
    include: [
      {
        model: sequelize.models.person_address,
        as: 'addresses',
        paranoid: false,
        include: [
          {
            model: sequelize.models.address,
            as: 'address',
            paranoid: false
          }
        ]
      },
      {
        model: sequelize.models.person_contact,
        as: 'person_contacts',
        paranoid: false,
        separate: true, // workaround to prevent 'contact_type_id' being truncated to 'contact_type_i'
        include: [
          {
            model: sequelize.models.contact,
            as: 'contact',
            paranoid: false
          }
        ]
      }
    ],
    transaction
  })

  for (const personAddress of person.addresses) {
    await personAddress.destroy({ force: true, transaction })
    await personAddress.address.destroy({ force: true, transaction })
  }

  for (const personContact of person.person_contacts) {
    await personContact.destroy({ force: true, transaction })
    await personContact.contact.destroy({ force: true, transaction })
  }

  await person.destroy({ force: true, transaction })

  await sendPermanentDeleteToAudit(PERSON, person, user)
}

module.exports = {
  createPeople,
  getPersonByReference,
  getPersonAndDogsByReference,
  getPersonAndDogsByIndex,
  updatePerson,
  updatePersonFields,
  getOwnerOfDog,
  deletePerson,
  purgePersonByReferenceNumber
}
