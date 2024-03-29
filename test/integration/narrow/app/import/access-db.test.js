const { saveParsedToBacklog } = require('../../../../../app/import/access/access-db')

jest.mock('../../../../../app/lib/db-functions')
const { dbCreate, dbDelete } = require('../../../../../app/lib/db-functions')

describe('AccessDB test', () => {
  test('Should process zero rows when no rows', async () => {
    dbDelete.mockResolvedValue()
    dbCreate.mockResolvedValue()
    await saveParsedToBacklog({ rows: [] })
    expect(dbCreate).toHaveBeenCalledTimes(0)
  })

  test('Should process one row when only one row ', async () => {
    dbDelete.mockResolvedValue()
    dbCreate.mockResolvedValue()
    await saveParsedToBacklog({ rows: [{ rowEleme: 456 }], errors: [] })
    expect(dbCreate).toHaveBeenCalledTimes(1)
  })
})
