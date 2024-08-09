const { devUser } = require('../../../mocks/auth')
const { INSURANCE } = require('../../../../app/constants/event/audit-event-object-types')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')

describe('Insurance repo', () => {
  const mockTransaction = jest.fn()
  jest.mock('../../../../app/config/db', () => ({
    models: {
      insurance: {
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      },
      insurance_company: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        restore: jest.fn(),
        destroy: jest.fn()
      }
    },
    where: jest.fn(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(mockTransaction)
    }),
    col: jest.fn().mockReturnValue(''),
    fn: jest.fn().mockReturnValue('')
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/lookups')
  const { getInsuranceCompany } = require('../../../../app/lookups')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendCreateToAudit, sendDeleteToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/repos/shared')
  const { updateParanoid } = require('../../../../app/repos/shared')

  const { getCompanies, createInsurance, updateInsurance, createOrUpdateInsurance, addCompany, deleteCompany } = require('../../../../app/repos/insurance')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('getCompanies', () => {
    const expectedAttributes = {
      include: [[expect.any(String), 'updatedOrCreatedAt']]
    }
    test('should sort companies alpha', async () => {
      sequelize.models.insurance_company.findAll.mockResolvedValue([
        {
          id: 1,
          company_name: 'Dogs Trust'
        }
      ])
      const insuranceCompanies = await getCompanies()
      expect(sequelize.models.insurance_company.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        order: [[expect.anything(), 'ASC']]
      })
      expect(sequelize.col).toHaveBeenCalledWith('company_name')
      expect(insuranceCompanies).toEqual([{ id: 1, name: 'Dogs Trust' }])
    })

    test('should sort companies alpha given company_name sortOrder', async () => {
      sequelize.models.insurance_company.findAll.mockResolvedValue([])
      await getCompanies({ key: 'company_name' })
      expect(sequelize.models.insurance_company.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        order: [[expect.anything(), 'ASC']]
      })
      expect(sequelize.col).toHaveBeenCalledWith('company_name')
    })

    test('should sort companies desc by created at given updated_at passed', async () => {
      sequelize.models.insurance_company.findAll.mockResolvedValue([])
      await getCompanies({ key: 'updated_at', order: 'DESC' })
      expect(sequelize.models.insurance_company.findAll).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        order: [[expect.anything(), 'DESC']]
      })
      expect(sequelize.col).toHaveBeenCalledWith('updated_at')
    })
  })

  describe('createInsurance', () => {
    test('createInsurance should start a transaction if one is not provided', async () => {
      const insurance = {
        company: 'test',
        renewalDate: '2020-01-01'
      }

      getInsuranceCompany.mockResolvedValue({ id: 1 })

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
  })

  describe('updateInsurance', () => {
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
  })

  describe('createOrUpdateInsurance', () => {
    test('createOrUpdateInsurance should create if not exists', async () => {
      const mockCreate = sequelize.models.insurance.create
      mockCreate.mockResolvedValue({
        updated_at: new Date('2024-07-01')
      })
      const mockUpdate = jest.fn()

      const data = {
        insurance: {
          company: 'test',
          renewalDate: '2020-01-01'
        }
      }

      const cdo = {
        id: 123,
        insurance: [],
        registration: {
          save: jest.fn()
        }
      }

      getInsuranceCompany.mockResolvedValue({ id: 1 })

      await createOrUpdateInsurance(data, cdo, {})

      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        renewal_date: '2020-01-01',
        dog_id: 123
      }, { transaction: expect.any(Object) })
      expect(mockUpdate).toHaveBeenCalledTimes(0)
      expect(cdo.registration.save).toHaveBeenCalled()
      expect(cdo.registration.insurance_details_recorded).toEqual(new Date('2024-07-01'))
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
        ],
        registration: {
          save: jest.fn()
        }
      }

      getInsuranceCompany.mockResolvedValue({ id: 1 })

      await createOrUpdateInsurance(data, cdo, {})

      expect(mockCreate).toHaveBeenCalledTimes(0)
      expect(mockUpdate).toHaveBeenCalledWith({
        company_id: 1,
        renewal_date: '2020-01-01'
      }, { transaction: expect.any(Object) })
      expect(cdo.registration.save).toHaveBeenCalled()
      expect(cdo.registration.insurance_details_recorded).toEqual(expect.any(Date))
    })
  })

  describe('addCompany', () => {
    const mockInsuranceCompany = {
      name: 'Rohan Pets R Us'
    }
    test('should create start new transaction if none passed', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue(null)

      sequelize.models.insurance_company.create.mockResolvedValue({
        id: 2,
        company_name: 'Rohan Pets R Us'
      })

      await addCompany(mockInsuranceCompany, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should create an insurance company', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue(null)

      sequelize.models.insurance_company.create.mockResolvedValue({
        id: 2,
        company_name: 'Rohan Pets R Us'
      })
      const createdInsuranceCompany = await addCompany(mockInsuranceCompany, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdInsuranceCompany).toEqual({
        id: 2,
        name: 'Rohan Pets R Us'
      })
      expect(sendCreateToAudit).toHaveBeenCalledWith(INSURANCE, {
        id: 2,
        name: 'Rohan Pets R Us'
      }, devUser)
    })

    test('should create a insurance company given it has been soft deleted', async () => {
      const restoreMock = jest.fn()
      const saveMock = jest.fn()
      updateParanoid.mockResolvedValue({
        id: 2,
        company_name: 'Rohan Pets R Us'
      })

      sequelize.models.insurance_company.findOne.mockResolvedValueOnce(null)
      const expectedParanoidModel = {
        id: 2,
        company_name: 'rohan Pets R Us',
        restore: restoreMock,
        save: saveMock
      }
      sequelize.models.insurance_company.findOne.mockResolvedValueOnce(expectedParanoidModel)

      const createdInsuranceCompany = await addCompany(mockInsuranceCompany, devUser, {})

      expect(sequelize.transaction).toHaveBeenCalledTimes(0)
      expect(createdInsuranceCompany).toEqual({
        id: 2,
        name: 'Rohan Pets R Us'
      })
      expect(sequelize.models.insurance_company.create).not.toHaveBeenCalled()
      expect(sendCreateToAudit).toHaveBeenCalledWith(INSURANCE, {
        id: 2,
        name: 'Rohan Pets R Us'
      }, devUser)
      expect(updateParanoid).toHaveBeenCalledWith(expectedParanoidModel, { company_name: 'Rohan Pets R Us' }, {})
    })

    test('should throw a DuplicateRecordError given insurance company already exists', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue({
        id: 5,
        company_name: 'Rohan Pets R Us'
      })
      const mockInsuranceCompanyPayload = {
        name: 'Rohan Pets R Us'
      }
      await expect(addCompany(mockInsuranceCompanyPayload, devUser, {})).rejects.toThrow(new DuplicateResourceError('Insurance company with name Rohan Pets R Us is already listed'))
    })

    test('should correctly reject if transaction fails', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue(null)
      const addCompanyTransaction = jest.fn()
      sequelize.transaction.mockImplementation(async (autoCallback) => {
        return autoCallback(addCompanyTransaction)
      })
      sequelize.models.insurance_company.create.mockImplementation(async (_insuranceCompany, options) => {
        options.transaction(false)
      })
      sendCreateToAudit.mockRejectedValue()

      const mockInsuranceCompanyPayload = {}

      await expect(addCompany(mockInsuranceCompanyPayload, devUser)).rejects.toThrow()

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
      expect(addCompanyTransaction).toHaveBeenCalledWith(false)
    })
  })

  describe('deleteCompany', () => {
    test('should create start new transaction if none passed', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValueOnce({
        id: 2,
        company_name: 'Rohan Pets R Us'
      })
      await deleteCompany(2, devUser)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should delete the insurance company', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue({
        id: 5,
        company_name: 'Rohan Pets R Us'
      })
      sequelize.models.insurance_company.destroy.mockResolvedValue(5)
      await deleteCompany(2, devUser, {})
      expect(sequelize.models.insurance_company.destroy).toHaveBeenCalled()
      expect(sendDeleteToAudit).toHaveBeenCalledWith(INSURANCE, {
        id: 5,
        name: 'Rohan Pets R Us'
      }, devUser)
    })

    test('should throw a NotFound given insurance company id does not exist', async () => {
      sequelize.models.insurance_company.findOne.mockResolvedValue(null)

      await expect(deleteCompany(2, devUser, {})).rejects.toThrow(new NotFoundError('Insurance company with id 2 does not exist'))
    })
  })
})
