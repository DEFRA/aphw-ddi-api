jest.mock('../../../../../app/lib/db-functions')
const { dbCreate } = require('../../../../../app/lib/db-functions')

const addImportedDog = require('../../../../../app/repos/dogs')

const { exampleDog } = require('./dogs')

describe('AddDog test', () => {
  test('Should run without error when valid row', async () => {
    dbCreate.mockResolvedValue(exampleDog)
    await addImportedDog(exampleDog)
    expect(dbCreate).toHaveBeenCalledTimes(3)
  })
})
