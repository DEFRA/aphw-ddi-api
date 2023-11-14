const { getBreed } = require('../../../../../app/lookups')
const { getMicrochipType } = require('../../../../../app/lookups')
jest.mock('../../../../../app/lookups')

const { getBreedIfValid, getMicrochipTypeIfValid, buildPerson } = require('../../../../../app/import/backlog-functions')

describe('BacklogFunctions test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getBreedIfValid throws error if invalid', async () => {
    getBreed.mockImplementation(() => Promise.resolve(null))
    const dog = { breed: 'not-valid' }
    await expect(getBreedIfValid(dog)).rejects.toThrow('Invalid breed: not-valid')
  })

  test('getBreedIfValid returns id if found', async () => {
    getBreed.mockImplementation(() => Promise.resolve({ id: 123 }))
    const payload = { breed: 'valid' }
    const res = await getBreedIfValid(payload)
    expect(res).toBe(123)
  })

  test('getMicrochipTypeIfValid returns null if missing input', async () => {
    getMicrochipType.mockImplementation(() => Promise.resolve(null))
    const payload = { microchipTypexxx: 'not-valid' }
    const res = await getMicrochipTypeIfValid(payload)
    expect(res).toBe(null)
  })

  test('getMicrochipTypeIfValid throws error if invalid', async () => {
    getMicrochipType.mockImplementation(() => Promise.resolve(null))
    const payload = { microchipType: 'not-valid' }
    await expect(getMicrochipTypeIfValid(payload)).rejects.toThrow('Invalid microchip type: not-valid')
  })

  test('getMicrochipTypeIfValid returns id if found', async () => {
    getMicrochipType.mockImplementation(() => Promise.resolve({ id: 456 }))
    const payload = { microchipType: 'valid' }
    const res = await getMicrochipTypeIfValid(payload)
    expect(res).toBe(456)
  })

  test('buildPerson calls buildContacts and adds phone1', async () => {
    const payload = { phone1: '123456' }
    const res = await buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('123456')
    expect(res.contacts[0].type).toBe('Phone')
  })

  test('buildPerson calls buildContacts and adds phone2', async () => {
    const payload = { phone2: '234567' }
    const res = await buildPerson(payload)
    expect(res).not.toBe(null)
    expect(res.contacts.length).toBe(1)
    expect(res.contacts[0].contact).toBe('234567')
    expect(res.contacts[0].type).toBe('Phone')
  })
})
