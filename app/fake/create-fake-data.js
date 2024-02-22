const sequelize = require('../config/db')
const { faker } = require('@faker-js/faker')
const { createPeople } = require('../repos/people')
const { createDogs } = require('../repos/dogs')
const { addToSearchIndex } = require('../repos/search')

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
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

const buildFakePerson = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    address: {
      addressLine1: faker.location.streetAddress(),
      town: faker.location.city(),
      postcode: `${faker.string.alpha({ length: 2 })}${faker.number.int({ min: 1, max: 32 })} ${faker.number.int({ min: 1, max: 9 })}${faker.string.alpha({ length: 2 })}`,
      country_id: 1
    }
  }
}

const buildFakeDog = () => {
  return {
    indexNumber: undefined,
    name: faker.person.firstName(),
    breed: 'XL Bully',
    exported: false,
    sex: faker.person.gender() === 'male' ? 'Male' : 'Female',
    colour: faker.color.human(),
    birthDate: faker.date.birthdate({ min: 1, max: 15, mode: 'age' }),
    microchipNumber: '123456789012345'
  }
}

const buildFakeEnforcement = () => {
  return {
    policeForce: 1,
    court: 1
  }
}

const createFakeCdo = async () => {
  const data = {
    owner: buildFakePerson(),
    dogs: [buildFakeDog()],
    enforcementDetails: buildFakeEnforcement()
  }
  return await createCdo(data)
}

module.exports = {
  createFakeCdo
}
