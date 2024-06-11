describe('Exemption order lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      exemption_order: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getExemptionOrder = require('../../../../app/lookups/exemption-order')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getExemptionOrder should generate correct where clause', async () => {
    sequelize.models.exemption_order.findOne.mockResolvedValue({
      id: 2,
      country: '2023'
    })

    const res = await getExemptionOrder('dummy')

    expect(res).toEqual({
      id: 2,
      country: '2023'
    })
    expect(sequelize.models.exemption_order.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { exemption_order: { [Op.iLike]: '%dummy%' } } }])
  })
})
