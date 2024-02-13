describe('Insurance repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      insurance: {
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      }
    },
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/lookups')
  const { getInsuranceCompany } = require('../../../../app/lookups')

  const { createInsurance, updateInsurance, createOrUpdateInsurance } = require('../../../../app/repos/insurance')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('createInsurance should start a transaction if one is not provided', async () => {
    const insurance = {
      company: 'test',
      renewalDate: '2020-01-01'
    }

    await createInsurance(1, insurance)

    expect(sequelize.transaction).toHaveBeenCalled()
  })

  test('createInsurance should not start a transaction if one is provided', async () => {
    const insurance = {
      company: 'test',
      renewalDate: '2020-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await createInsurance(1, insurance, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('createInsurance should throw an error if the company is not found', async () => {
    const insurance = {
      company: 'test',
      renewalDate: '2020-01-01'
    }

    getInsuranceCompany.mockResolvedValue(null)

    await expect(createInsurance(1, insurance, {})).rejects.toThrow('Company not found')
  })

  test('createInsurance should create an insurance record', async () => {
    const insurance = {
      company: 'test',
      renewalDate: '2020-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await createInsurance(1, insurance, {})

    expect(sequelize.models.insurance.create).toHaveBeenCalledWith({
      company_id: 1,
      renewal_date: '2020-01-01',
      dog_id: 1
    }, { transaction: expect.any(Object) })
  })

  test('createInsurance should throw an error if the insurance record cannot be created', async () => {
    const insurance = {
      company: 'test',
      renewalDate: '2020-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })
    sequelize.models.insurance.create.mockRejectedValue(new Error('test'))

    await expect(createInsurance(1, insurance, {})).rejects.toThrow('test')
  })

  test('updateInsurance should start a transaction if one is not provided', async () => {
    const data = {
      company: 'test',
      renewalDate: '2023-01-01'
    }

    await updateInsurance(sequelize.models.insurance, data)

    expect(sequelize.transaction).toHaveBeenCalled()
  })

  test('updateInsurance should not start a transaction if one is provided', async () => {
    const data = {
      company: 'test',
      renewalDate: '2023-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await updateInsurance(sequelize.models.insurance, data, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('updateInsurance should throw an error if the company is not found', async () => {
    const data = {
      company: 'test',
      renewalDate: '2023-01-01'
    }

    getInsuranceCompany.mockResolvedValue(null)

    await expect(updateInsurance(sequelize.models.insurance, data, {})).rejects.toThrow('Company not found')
  })

  test('updateInsurance should update an insurance record', async () => {
    const data = {
      company: 'test',
      renewalDate: '2023-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await updateInsurance(sequelize.models.insurance, data, {})

    expect(sequelize.models.insurance.update).toHaveBeenCalledWith({
      company_id: 1,
      renewal_date: '2023-01-01'
    }, { transaction: expect.any(Object) })
  })

  test('updateInsurance should throw an error if the insurance record cannot be updated', async () => {
    const data = {
      company: 'test',
      renewalDate: '2023-01-01'
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })
    sequelize.models.insurance.update.mockRejectedValue(new Error('test'))

    await expect(updateInsurance(sequelize.models.insurance, data, {})).rejects.toThrow('test')
  })

  test('createOrUpdateInsurance should create if not exists', async () => {
    const mockCreate = sequelize.models.insurance.create
    mockCreate.mockResolvedValue()
    const mockUpdate = jest.fn()

    const data = {
      insurance: {
        company: 'test',
        renewalDate: '2020-01-01'
      }
    }

    const cdo = {
      id: 123,
      insurance: []
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await createOrUpdateInsurance(data, cdo, {})

    expect(mockCreate).toHaveBeenCalledWith({
      company_id: 1,
      renewal_date: '2020-01-01',
      dog_id: 123
    }, { transaction: expect.any(Object) })
    expect(mockUpdate).toHaveBeenCalledTimes(0)
  })

  test('createOrUpdateInsurance should update if exists', async () => {
    const mockCreate = sequelize.models.insurance.create
    mockCreate.mockResolvedValue()
    const mockUpdate = jest.fn()

    const data = {
      insurance: {
        company: 'test',
        renewalDate: '2020-01-01'
      }
    }

    const cdo = {
      id: 123,
      insurance: [
        { id: 1, name: 'ins 1', update: mockUpdate },
        { id: 2, name: 'ins 2', update: mockUpdate }
      ]
    }

    getInsuranceCompany.mockResolvedValue({ id: 1 })

    await createOrUpdateInsurance(data, cdo, {})

    expect(mockCreate).toHaveBeenCalledTimes(0)
    expect(mockUpdate).toHaveBeenCalledWith({
      company_id: 1,
      renewal_date: '2020-01-01'
    }, { transaction: expect.any(Object) })
  })
})
