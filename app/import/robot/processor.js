const { createCdo } = require('../../repos/cdo')
const { addYears } = require('date-fns')
const { calculateNeuteringDeadline } = require('../../dto/dto-helper')
const { lookupPoliceForceByPostcode } = require('./police')
const getPoliceForce = require('../../lookups/police-force')
const sequelize = require('../../config/db')
const { dbFindOne } = require('../../lib/db-functions')
const { robotImportUser } = require('../../constants/import')

const processRegisterRows = async (register, t) => {
  let currentDataRow
  for (const record of register.add) {
    const owner = record.owner

    owner.phoneNumber = `${owner.phoneNumber}`.startsWith('0') ? `${owner.phoneNumber}` : `0${owner.phoneNumber}`

    const data = {
      owner: {
        ...owner,
        primaryTelephone: owner.phoneNumber
      },
      dogs: record.dogs.map(d => ({
        ...d,
        source: 'ROBOT',
        breed: 'XL Bully',
        status: 'Exempt',
        sex: d.gender,
        colour: d.colour,
        microchipDeadline: new Date(2024, 2, 31),
        neuteringDeadline: calculateNeuteringDeadline(d.birthDate),
        applicationFeePaid: d.certificateIssued,
        insurance: {
          company: 'Dogs Trust',
          renewalDate: addYears(d.insuranceStartDate, 1)
        }
      })),
      enforcementDetails: {
        cdoIssued: null,
        cdoExpiry: null,
        policeForce: owner.policeForceId
      }
    }

    currentDataRow = data

    try {
      await createCdo(data, robotImportUser, t)
    } catch (err) {
      console.log(err)
      console.log('Row in error:', JSON.parse(JSON.stringify(currentDataRow)))
    }
  }
}

const populatePoliceForce = async (register) => {
  for (const record of register.add) {
    const forceId = await lookupPoliceForce(record.owner.address.postcode)

    if (!forceId) {
      record.dogs.forEach(x => {
        console.log(`IndexNumber ${x.indexNumber} error: Cannot find police force for postcode ${record.owner.address.postcode}`)
      })
      continue
    }

    for (const dog of record.dogs) {
      const registration = await dbFindOne(sequelize.models.registration, {
        where: { dog_id: dog.indexNumber }
      })

      if (!registration) {
        throw new Error(`CDO not found - indexNumber ${dog.indexNumber}`)
      }

      if (!registration.police_force_id) {
        registration.police_force_id = forceId
        registration.save()
      }
    }
  }
}

const lookupPoliceForce = async (postcode) => {
  const policeForce = await lookupPoliceForceByPostcode(postcode.replace(' ', ''), true)

  if (policeForce) {
    const force = await getPoliceForce(policeForce.name)

    if (force) {
      return force.id
    }
  }

  return null
}

module.exports = {
  processRegisterRows,
  populatePoliceForce
}
