const { faker } = require('@faker-js/faker')
const { createCdo } = require('./cdo')
const { robotImportUser } = require('../constants/import')

const createFakeOwner = () => {
  let firstName = faker.person.firstName()
  while (firstName.length > 24) {
    firstName = faker.person.firstName()
  }

  let lastName = faker.person.lastName()
  while (lastName.length > 24) {
    lastName = faker.person.lastName()
  }

  return {
    firstName,
    lastName,
    birth_date: faker.date.birthdate({ min: 16, max: 80, mode: 'age' }),
    address: {
      addressLine1: faker.location.streetAddress(),
      town: faker.location.city(),
      postcode: `${faker.string.alpha({ length: 2 })}${faker.number.int({ min: 1, max: 32 })} ${faker.number.int({ min: 1, max: 9 })}${faker.string.alpha({ length: 2 })}`,
      country: faker.helpers.arrayElement(['England', 'Wales'])
    },
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmailfake.com`,
    primaryTelephone: `0${faker.string.numeric({ length: 10 })}`,
    secondaryTelephone: `0${faker.string.numeric({ length: 10 })}`
  }
}

const createFakeDog = () => {
  return {
    name: faker.person.firstName(),
    breed: faker.helpers.arrayElement(['XL Bully', 'Pit Bull Terrier', 'Japanese Tosa']),
    sex: faker.helpers.arrayElement(['Male', 'Female']),
    colour: faker.helpers.arrayElement(['White', 'Brown', 'Grey', 'Blond', 'Ginger']),
    birth_date: faker.date.birthdate({ min: 0, max: 14, mode: 'age' }),
    insurance: {
      company: 'Dogs Trust',
      renewalDate: faker.date.future({ years: 1 })
    },
    microchipNumber: faker.string.numeric({ length: 15 }),
    cdoIssued: new Date(2024, 1, 12),
    cdoExpiry: new Date(2024, 3, 12)
  }
}

const createFakeEnforcementDetails = () => {
  return {
    policeForce: faker.number.int({ min: 1, max: 50 }),
    court: faker.number.int({ min: 1, max: 100 })
  }
}

const createFakeCdos = async (numRecords) => {
  for (let i = 0; i < numRecords; i++) {
    const cdoData = {
      owner: createFakeOwner(),
      dogs: [createFakeDog()],
      enforcementDetails: createFakeEnforcementDetails()
    }
    await createCdo(cdoData, robotImportUser)
  }
}

module.exports = {
  createFakeCdos
}
