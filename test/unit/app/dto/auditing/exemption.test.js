const { preChangedExemptionAudit, postChangedExemptionAudit } = require('../../../../../app/dto/auditing/exemption')
const { truncDate } = require('../../../../../app/dto/dto-helper')

describe('ExemptionAudit test', () => {
  test('pre should handle undefined', () => {
    const cdo = { registration: {} }
    const res = preChangedExemptionAudit(cdo)
    expect(res).toEqual({
      application_fee_paid: null,
      cdo_expiry: null,
      cdo_issued: null,
      certificate_issued: null,
      court: null,
      exemption_order: null,
      index_number: null,
      insurance_company: null,
      insurance_renewal_date: null,
      joined_exemption_scheme: null,
      legislation_officer: null,
      microchip_deadline: null,
      microchip_verification: null,
      neutering_confirmation: null,
      police_force: null,
      removed_from_cdo_process: null,
      typed_by_dlo: null,
      withdrawn: null
    })
  })

  test('pre should handle simple fields', () => {
    const cdo = {
      index_number: 'ED12345',
      registration: {
        application_fee_paid: new Date(2024, 1, 1),
        cdo_expiry: new Date(2024, 1, 2),
        cdo_issued: new Date(2024, 1, 3),
        certificate_issued: new Date(2024, 1, 4),
        joined_exemption_scheme: new Date(2024, 1, 6),
        legislation_officer: 'dlo1',
        microchip_deadline: new Date(2024, 1, 7),
        microchip_verification: new Date(2024, 1, 8),
        neutering_confirmation: new Date(2024, 1, 9),
        removed_from_cdo_process: new Date(2024, 1, 10),
        typed_by_dlo: new Date(2024, 1, 11),
        withdrawn: new Date(2024, 1, 12),
        police_force: {
          name: 'force name 1'
        },
        exemption_order: {
          exemption_order: 'exempt number'
        },
        court: {
          name: 'court1'
        }
      }
    }
    const res = preChangedExemptionAudit(cdo)
    expect(res).toEqual({
      application_fee_paid: '2024-02-01T00:00:00.000Z',
      cdo_expiry: '2024-02-02T00:00:00.000Z',
      cdo_issued: '2024-02-03T00:00:00.000Z',
      certificate_issued: '2024-02-04T00:00:00.000Z',
      court: 'court1',
      exemption_order: 'exempt number',
      index_number: 'ED12345',
      insurance_company: null,
      insurance_renewal_date: null,
      joined_exemption_scheme: '2024-02-06T00:00:00.000Z',
      legislation_officer: 'dlo1',
      microchip_deadline: '2024-02-07T00:00:00.000Z',
      microchip_verification: '2024-02-08T00:00:00.000Z',
      neutering_confirmation: '2024-02-09T00:00:00.000Z',
      police_force: 'force name 1',
      removed_from_cdo_process: '2024-02-10T00:00:00.000Z',
      typed_by_dlo: '2024-02-11T00:00:00.000Z',
      withdrawn: '2024-02-12T00:00:00.000Z'
    })
  })

  test('pre should handle latest insurance', () => {
    const cdo = {
      registration: {
      },
      insurance: [
        {
          id: 2,
          company: {
            company_name: 'middle'
          },
          renewal_date: new Date(2024, 1, 2)
        },
        {
          id: 3,
          company: {
            company_name: 'latest'
          },
          renewal_date: new Date(2024, 1, 3)
        },
        {
          id: 1,
          company: {
            company_name: 'oldest'
          },
          renewal_date: new Date(2024, 1, 1)
        }
      ]
    }
    const res = preChangedExemptionAudit(cdo)
    expect(res).toEqual({
      application_fee_paid: null,
      cdo_expiry: null,
      cdo_issued: null,
      certificate_issued: null,
      court: null,
      exemption_order: null,
      index_number: null,
      insurance_company: 'latest',
      insurance_renewal_date: '2024-02-03',
      joined_exemption_scheme: null,
      legislation_officer: null,
      microchip_deadline: null,
      microchip_verification: null,
      neutering_confirmation: null,
      police_force: null,
      removed_from_cdo_process: null,
      typed_by_dlo: null,
      withdrawn: null
    })
  })

  test('post should handle null', () => {
    const data = { }
    const res = postChangedExemptionAudit(data)
    expect(res).toEqual({
      application_fee_paid: null,
      cdo_expiry: null,
      cdo_issued: null,
      certificate_issued: null,
      court: null,
      exemption_order: null,
      index_number: null,
      insurance_company: null,
      insurance_renewal_date: null,
      joined_exemption_scheme: null,
      legislation_officer: null,
      microchip_deadline: null,
      microchip_verification: null,
      neutering_confirmation: null,
      police_force: null,
      removed_from_cdo_process: null,
      typed_by_dlo: null,
      withdrawn: null
    })
  })

  test('post should remove any time components', () => {
    const data = {
      applicationFeePaid: new Date(),
      cdoExpiry: new Date(),
      cdoIssued: new Date(),
      certificateIssued: new Date()
    }
    const res = postChangedExemptionAudit(data)
    expect(res).toEqual({
      application_fee_paid: truncDate(new Date()),
      cdo_expiry: truncDate(new Date()),
      cdo_issued: truncDate(new Date()),
      certificate_issued: truncDate(new Date()),
      court: null,
      exemption_order: null,
      index_number: null,
      insurance_company: null,
      insurance_renewal_date: null,
      joined_exemption_scheme: null,
      legislation_officer: null,
      microchip_deadline: null,
      microchip_verification: null,
      neutering_confirmation: null,
      police_force: null,
      removed_from_cdo_process: null,
      typed_by_dlo: null,
      withdrawn: null
    })
  })

  test('post should handle insurance', () => {
    const data = {
      insurance: {
        company: 'Insurance Company',
        renewalDate: new Date()
      }
    }
    const res = postChangedExemptionAudit(data)
    expect(res).toEqual({
      application_fee_paid: null,
      cdo_expiry: null,
      cdo_issued: null,
      certificate_issued: null,
      court: null,
      exemption_order: null,
      index_number: null,
      insurance_company: 'Insurance Company',
      insurance_renewal_date: truncDate(new Date()),
      joined_exemption_scheme: null,
      legislation_officer: null,
      microchip_deadline: null,
      microchip_verification: null,
      neutering_confirmation: null,
      police_force: null,
      removed_from_cdo_process: null,
      typed_by_dlo: null,
      withdrawn: null
    })
  })
})
