describe('Courts lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      court: {
        findOne: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  const getCourt = require('../../../../app/lookups/court')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getCourt should return court', async () => {
    sequelize.models.court.findOne.mockResolvedValue({
      id: 2,
      name: 'Maidstone Magistrates\' Courts'
    })

    const court = await getCourt('dummy')

    expect(court).toEqual({
      id: 2,
      name: 'Maidstone Magistrates\' Courts'
    })
  })

  test('getCourts should return null if blank court name supplied', async () => {
    const court = await getCourt('')
    expect(court).toBe(null)
  })

  test('getCourts should return null if null court name supplied', async () => {
    const court = await getCourt(null)
    expect(court).toBe(null)
  })
})
