jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

jest.mock('../../../../../app/lookups')
const { getCounty, getCountry, getPersonType, getContactType } = require('../../../../../app/lookups')

const { examplePerson, examplePeople } = require('./person-data')
const { addPeople } = require('../../../../../app/person/add-person')

jest.mock('../../../../../app/config/db', () => ({
  models: {
    person: {
      create: jest.fn()
    }
  },
  transaction: jest.fn()
}))

const sequelize = require('../../../../../app/config/db')

describe('AddPerson test', () => {
  test('Should run multiple rows in existing transaction', async () => {
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPeople(examplePeople, {})
    expect(res).not.toBe(null)
    expect(res.length).toBe(2)
    expect(res[0].id).toBe(1122)
    expect(sequelize.transaction).not.toHaveBeenCalled()
  })
})
