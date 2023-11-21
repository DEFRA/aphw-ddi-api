jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

jest.mock('../../../../../app/lookups')
const { getTitle, getCounty, getCountry, getPersonType, getContactType } = require('../../../../../app/lookups')

const { examplePerson, examplePersonWithTitleAndCounty, examplePeople } = require('./person-data')
const { addPerson, addPeople } = require('../../../../../app/person/add-person')

describe('AddPerson test', () => {
  test('Should run without error when valid row', async () => {
    getTitle.mockResolvedValue([{ id: 1 }])
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPerson(examplePerson)
    expect(res).not.toBe(null)
    expect(res.id).toBe(1122)
  })

  test('Should run without error when valid row incl title and county', async () => {
    getTitle.mockResolvedValue([{ id: 1 }])
    getCounty.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getContactType.mockResolvedValue([{ id: 1 }])
    dbCreate.mockResolvedValue(examplePersonWithTitleAndCounty)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await addPerson(examplePersonWithTitleAndCounty)
    expect(res).not.toBe(null)
    expect(res.id).toBe(2233)
  })

  test('Should run without error when valid row and inside transaction', async () => {
    getTitle.mockResolvedValue([{ id: 1 }])
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
    getTitle.mockResolvedValue([{ id: 1 }])
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
