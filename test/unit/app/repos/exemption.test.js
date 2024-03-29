const dummyUser = {
  username: 'dummy-user',
  displayname: 'Dummy User'
}

describe('Exemption repo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/repos/cdo')
  const { getCdo } = require('../../../../app/repos/cdo')

  jest.mock('../../../../app/repos/dogs')
  const { updateStatus } = require('../../../../app/repos/dogs')

  jest.mock('../../../../app/repos/insurance')
  const { createOrUpdateInsurance } = require('../../../../app/repos/insurance')

  jest.mock('../../../../app/lookups')
  const { getCourt, getPoliceForce } = require('../../../../app/lookups')

  jest.mock('../../../../app/messaging/send-event')
  const { sendEvent } = require('../../../../app/messaging/send-event')

  const { updateExemption, autoChangeStatus } = require('../../../../app/repos/exemption')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendEvent.mockResolvedValue()
    createOrUpdateInsurance.mockResolvedValue()
  })

  test('updateExemption should start a transaction if one is not provided', async () => {
    await updateExemption({ indexNumber: '123' }, 'dummy-username')

    expect(sequelize.transaction).toHaveBeenCalled()
  })

  test('updateExemption should not start a transaction if one is provided', async () => {
    const data = {
      exemptionOrder: '2015',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation_date: '2020-04-01',
      microchip_verification_date: '2020-04-01',
      exemption_scheme_join_date: '2020-05-01',
      exemption_order: {
        exemption_order: '2015'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, dummyUser, {})

    expect(sequelize.transaction).not.toHaveBeenCalled()
  })

  test('updateExemption should update the CDO registration', async () => {
    const data = {
      exemptionOrder: '2015',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation: '2020-04-01',
      microchip_verification: '2020-04-01',
      exemption_scheme_join: '2020-05-01',
      exemption_order: {
        exemption_order: '2015'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, dummyUser, {})

    expect(registration.save).toHaveBeenCalled()
    expect(createOrUpdateInsurance).toHaveBeenCalled()
  })

  test('updateExemption should not call getCourt if no court supplied', async () => {
    const data = {
      exemptionOrder: '2023',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation: '2020-04-01',
      microchip_verification: '2020-04-01',
      exemption_scheme_join: '2020-05-01',
      exemption_order: {
        exemption_order: '2023'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, dummyUser, {})

    expect(getCourt).not.toHaveBeenCalled()
  })

  test('updateExemption should call getCourt if court supplied', async () => {
    const data = {
      exemptionOrder: '2023',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01',
      court: 'Manchester Crown Court'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation: '2020-04-01',
      microchip_verification: '2020-04-01',
      exemption_scheme_join: '2020-05-01',
      exemption_order: {
        exemption_order: '2023'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await updateExemption(data, dummyUser, {})

    expect(getCourt).toHaveBeenCalled()
  })

  test('updateExemption should throw an error if the CDO is not found', async () => {
    getCdo.mockResolvedValue(null)

    await expect(updateExemption({ indexNumber: '123' }, dummyUser, {})).rejects.toThrow('CDO not found: 123')
  })

  test('updateExemption should throw an error if the court is not found', async () => {
    const data = {
      exemptionOrder: '2015',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'test',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation: '2020-04-01',
      microchip_verification: '2020-04-01',
      exemption_scheme_join: '2020-05-01',
      exemption_order: {
        exemption_order: '2015'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ id: '123', registration, insurance: [] })
    getCourt.mockResolvedValue(null)

    await expect(updateExemption(data, dummyUser, {})).rejects.toThrow('Court not found: test')
  })

  test('updateExemption should throw an error if the police force is not found', async () => {
    getCdo.mockResolvedValue({ registration: {}, insurance: [] })
    getPoliceForce.mockResolvedValue(null)

    await expect(updateExemption({ indexNumber: '123', policeForce: 'test' }, dummyUser, {})).rejects.toThrow('Police force not found: test')
  })

  test('updateExemption should throw error if no username for auditing', async () => {
    const data = {
      exemptionOrder: '2015',
      indexNumber: 'ED123',
      cdoIssued: '2020-01-01',
      cdoExpiry: '2020-02-01',
      court: 'Test Court',
      policeForce: 'Test Police Force',
      legislationOfficer: 'Test Officer',
      certificateIssued: '2020-03-01',
      applicationFeePaid: '2020-03-01',
      neuteringConfirmation: '2020-04-01',
      microchipVerification: '2020-04-01',
      exemptionSchemeJoin: '2020-05-01'
    }

    const registration = {
      cdo_issued: '2020-01-01',
      cdo_expiry: '2020-02-01',
      court_id: 1,
      police_force_id: 1,
      legislation_officer: 'Test Officer',
      certificate_issued: '2020-03-01',
      application_fee_paid: '2020-03-01',
      neutering_confirmation: '2020-04-01',
      microchip_verification: '2020-04-01',
      exemption_scheme_join: '2020-05-01',
      exemption_order: {
        exemption_order: '2015'
      },
      save: jest.fn()
    }

    getCdo.mockResolvedValue({ registration, insurance: [] })
    getCourt.mockResolvedValue({ id: 1, name: 'Test Court' })
    getPoliceForce.mockResolvedValue({ id: 1, name: 'Test Police Force' })

    await expect(updateExemption(data, '', {})).rejects.toThrow('Username and displayname are required for auditing')
  })

  test('autoChangeStatus should handle no status change when doesnt satisfy any rules', async () => {
    updateStatus.mockResolvedValue()

    const cdo = {
      registration: {
      }
    }

    const payload = {
    }

    await autoChangeStatus(cdo, payload)

    expect(updateStatus).toHaveBeenCalledTimes(0)
  })

  test('autoChangeStatus should handle Pre-exempt to Failed', async () => {
    updateStatus.mockResolvedValue()

    const cdo = {
      index_number: 'ED123',
      status: {
        status: 'Pre-exempt'
      },
      registration: {
      }
    }

    const payload = {
      removedFromCdoProcess: new Date().toISOString()
    }

    await autoChangeStatus(cdo, payload, {})

    expect(updateStatus).toHaveBeenCalledWith('ED123', 'Failed', {})
  })

  test('autoChangeStatus should handle Pre-exempt to Exempt', async () => {
    updateStatus.mockResolvedValue()

    const cdo = {
      index_number: 'ED123',
      status: {
        status: 'Pre-exempt'
      },
      registration: {
      }
    }

    const payload = {
      certificateIssued: new Date().toISOString(),
      insurance: {
        renewalDate: new Date(2040, 1, 1)
      }
    }

    await autoChangeStatus(cdo, payload, {})

    expect(updateStatus).toHaveBeenCalledWith('ED123', 'Exempt', {})
  })

  test('autoChangeStatus should handle Interim-exempt to Pre-Exempt', async () => {
    updateStatus.mockResolvedValue()

    const cdo = {
      index_number: 'ED123',
      status: {
        status: 'Interim exempt'
      },
      registration: {
      }
    }

    const payload = {
      cdoIssued: new Date().toISOString(),
      insurance: {
        renewalDate: new Date(2040, 1, 1)
      }
    }

    await autoChangeStatus(cdo, payload, {})

    expect(updateStatus).toHaveBeenCalledWith('ED123', 'Pre-exempt', {})
  })

  test('autoChangeStatus should handle 2023 order to Withdrawn', async () => {
    updateStatus.mockResolvedValue()

    const cdo = {
      index_number: 'ED123',
      status: {
        status: 'Exempt'
      },
      registration: {
        exemption_order: {
          exemption_order: '2023'
        }
      }
    }

    const payload = {
      withdrawn: new Date().toISOString()
    }

    await autoChangeStatus(cdo, payload, {})

    expect(updateStatus).toHaveBeenCalledWith('ED123', 'Withdrawn', {})
  })
})
