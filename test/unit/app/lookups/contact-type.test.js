describe('Contact type lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      contact_type: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getContactType = require('../../../../app/lookups/contact-type')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getContactType should generate correct where clause', async () => {
    sequelize.models.contact_type.findOne.mockResolvedValue({
      id: 2,
      contact_type: 'Email'
    })

    const contactType = await getContactType('dummy')

    expect(contactType).toEqual({
      id: 2,
      contact_type: 'Email'
    })
    expect(sequelize.models.contact_type.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { contact_type: { [Op.iLike]: '%dummy%' } } }])
  })
})
