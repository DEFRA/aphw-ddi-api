jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

jest.mock('../../../../../app/lookups')
const { getCounty, getCountry, getPersonType, getContactType } = require('../../../../../app/lookups')

const { examplePerson, examplePersonWithCounty, examplePeople } = require('./person-data')
const { addPerson, addPeople } = require('../../../../../app/person/add-person')

describe('AddPerson test', () => {
  test('Should run without error when valid row', async () => {
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPerson(examplePerson)
    expect(res).not.toBe(null)
    expect(res.id).toBe(1122)
  })

  test('Should run without error when valid row incl county', async () => {
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePersonWithCounty)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPerson(examplePersonWithCounty)
    expect(res).not.toBe(null)
    expect(res.id).toBe(2233)
  })

  test('Should run without error when valid row and inside transaction', async () => {
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPerson(examplePerson, 123)
    expect(res).not.toBe(null)
    expect(res.id).toBe(1122)
  })

  test('Should run without error when valid multiple rows', async () => {
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPeople(examplePeople)
    expect(res).not.toBe(null)
    expect(res.length).toBe(2)
    expect(res[0].id).toBe(1122)
  })
})
