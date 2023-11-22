jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

const addDog = require('../../../../../app/dog/add-dog')

const { exampleDog } = require('./dogs')

describe('AddDog test', () => {
  test('Should run without error when valid row', async () => {
    dbCreate.mockResolvedValue(exampleDog)
    await addDog(exampleDog)
    expect(dbCreate).toHaveBeenCalledTimes(3)
  })
})
