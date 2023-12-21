describe('Exemption repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/cdo')
  const { getCdo } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/repos/insurance')
  const { createInsurance, updateInsurance } = require('../../../../app/repos/insurance')

  jest.mock('../../../../app/lookups')
  const { getCourt, getPoliceForce } = require('../../../../app/lookups')

  const { updateExemption } = require('../../../../app/repos/exemption')

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('updateExemption should start a transaction if one is not provided', async () => {
    await updateExemption({ indexNumber: '123' })

    expect(sequelize.transaction).toHaveBeenCalled()
  })

  test('updateExemption should not start a transaction if one is provided', async () => {
    const data = {
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      applicationFeePaidDate: '2020-03-01',
      neuteringConfirmationDate: '2020-04-01',
      exemptionSchemeJoinDate: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      application_fee_paid_date: '2020-03-01',
      neutering_confirmation_date: '2020-04-01',
      exemption_scheme_join_date: '2020-05-01',
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('updateExemption should update the CDO registration', async () => {
    const data = {
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      applicationFeePaidDate: '2020-03-01',
      neuteringConfirmationDate: '2020-04-01',
      exemptionSchemeJoinDate: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      application_fee_paid_date: '2020-03-01',
      neutering_confirmation_date: '2020-04-01',
      exemption_scheme_join_date: '2020-05-01',
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, {})

    expect(registration.save).toHaveBeenCalled()
  })

  test('updateExemption should create insurance if none exists', async () => {
    const data = {
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      applicationFeePaidDate: '2020-03-01',
      neuteringConfirmationDate: '2020-04-01',
      exemptionSchemeJoinDate: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2021-06-01'
      }
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      application_fee_paid_date: '2020-03-01',
      neutering_confirmation_date: '2020-04-01',
      exemption_scheme_join_date: '2020-05-01',
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ id: '123', registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, {})

    expect(createInsurance).toHaveBeenCalledWith('123', {
      company: 'Test Insurance',
      renewalDate: '2021-06-01'
    },
    expect.any(Object))
  })

  test('updateExemption should update insurance if it exists', async () => {
    const data = {
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      applicationFeePaidDate: '2020-03-01',
      neuteringConfirmationDate: '2020-04-01',
      exemptionSchemeJoinDate: '2020-05-01',
      insurance: {
        company: 'Test Insurance',
        renewalDate: '2021-06-01'
      }
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      application_fee_paid_date: '2020-03-01',
      neutering_confirmation_date: '2020-04-01',
      exemption_scheme_join_date: '2020-05-01',
      save: jest.fn()
    }

    const insurance = {
      id: 1,
      company: 'Test Insurance',
      renewal_date: '2020-06-01',
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [insurance] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, {})

    expect(updateInsurance).toHaveBeenCalledWith(insurance, {
      company: 'Test Insurance',
      renewalDate: '2021-06-01'
    },
    expect.any(Object))
  })

  test('updateExemption should throw an error if the CDO is not found', async () => {
    getCdo.mockResolvedValue(null)

    await expect(updateExemption({ indexNumber: '123' }, {})).rejects.toThrow('CDO not found: 123')
  })

  test('updateExemption should throw an error if the court is not found', async () => {
    getCdo.mockResolvedValue({ registration: {}, insurance: [] })
    getCourt.mockResolvedValue(null)

    await expect(updateExemption({ indexNumber: '123', court: 'test' }, {})).rejects.toThrow('Court not found: test')
  })

  test('updateExemption should throw an error if the police force is not found', async () => {
    getCdo.mockResolvedValue({ registration: {}, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue(null)

    await expect(updateExemption({ indexNumber: '123', court: 'test', policeForce: 'test' }, {})).rejects.toThrow('Police force not found: test')
  })
})
