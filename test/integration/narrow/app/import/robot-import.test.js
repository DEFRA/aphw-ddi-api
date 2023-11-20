const { processRobotImport } = require('../../../../../app/import/robot-import')

jest.mock('../../../../../app/lookups')
const { getBreed, getCountry, getPersonType } = require('../../../../../app/lookups')

jest.mock('../../../../../app/dog/get-dog')
const { getAllDogIds } = require('../../../../../app/dog/get-dog')

jest.mock('../../../../../app/person/add-person')
const { addPerson } = require('../../../../../app/person/add-person')

jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

const { importOneDogOnePerson, invalidImportSchema, exampleDog, examplePerson } = require('./robot-import-data')

describe('RobotImport test', () => {
  test('Should return zero stats when no rows', async () => {
    getBreed.mockResolvedValue([{ id: 1 }])
    getAllDogIds.mockResolvedValue([])
    const res = await processRobotImport({ data: [] })
    expect(res).not.toBe(null)
    expect(res.stats.errors.length).toBe(0)
    expect(res.stats.created.length).toBe(0)
  })

  test('Should run without error when valid row', async () => {
    getBreed.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getAllDogIds.mockResolvedValue([])
    dbCreate.mockResolvedValue(exampleDog)
    addPerson.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await processRobotImport(importOneDogOnePerson)
    expect(res).not.toBe(null)
    expect(res.stats.errors.length).toBe(0)
    expect(res.stats.created.length).toBe(3)
    expect(res.stats.created[0]).toBe('New dog index number 1234 created')
    expect(res.stats.created[1]).toBe('Created person 5566')
    expect(res.stats.created[2]).toBe('Linked person 5566 to dog 1234')
  })

  test('Should return error when existing dog', async () => {
    getBreed.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getAllDogIds.mockResolvedValue([{ id: 1234 }])
    dbCreate.mockResolvedValue(exampleDog)
    addPerson.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await processRobotImport(importOneDogOnePerson)
    expect(res).not.toBe(null)
    expect(res.stats.errors.length).toBe(2)
    expect(res.stats.created.length).toBe(0)
    expect(res.stats.errors[0]).toBe('Dog index number 1234 already exists')
  })

  test('Should return error when invalid schema', async () => {
    getBreed.mockResolvedValue([{ id: 1 }])
    getCountry.mockResolvedValue([{ id: 1 }])
    getAllDogIds.mockResolvedValue([])
    dbCreate.mockResolvedValue(exampleDog)
    addPerson.mockResolvedValue(examplePerson)
    getPersonType.mockResolvedValue({ id: 1 })
    const res = await processRobotImport(invalidImportSchema)
    expect(res).not.toBe(null)
    expect(res.stats.errors.length).toBe(1)
    expect(res.stats.created.length).toBe(0)
    expect(res.stats.errors[0]).toBe('"data[0].dogs[0].name" is required')
  })
})
