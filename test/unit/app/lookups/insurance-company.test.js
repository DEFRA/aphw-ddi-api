describe('Insurance company lookup test', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      insurance_company: {
        findOne: jest.fn()
      }
    },
    Op: {
      iLike: jest.fn()
    }
  }))

  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const getInsuranceCompany = require('../../../../app/lookups/insurance-company')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('getInsuranceCompany should generate correct where clause', async () => {
    sequelize.models.insurance_company.findOne.mockResolvedValue({
      id: 2,
      country: 'Dogs Trust'
    })

    const res = await getInsuranceCompany('dummy')

    expect(res).toEqual({
      id: 2,
      country: 'Dogs Trust'
    })
    expect(sequelize.models.insurance_company.findOne.mock.calls[0]).toEqual([{ attributes: ['id'], where: { company_name: { [Op.iLike]: '%dummy%' } } }])
  })
})
