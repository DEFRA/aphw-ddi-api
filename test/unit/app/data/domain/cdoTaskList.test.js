const { CdoTaskList, Cdo, Exemption, CdoTask } = require('../../../../../app/data/domain')
const { buildCdo, buildExemption, buildTask, buildCdoInsurance, buildCdoDog } = require('../../../../mocks/cdo/domain')
describe('CdoTaskList', () => {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 60)

  test('should instantiate ', () => {
    const cdo = buildCdo()
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList._cdo).toBeInstanceOf(Cdo)
  })

  test('should show applicationPackSent in default state', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: null
    })
    const cdo = buildCdo({
      exemption: new Exemption(exemptionProperties)
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.applicationPackSent).toEqual(expect.objectContaining({
      key: 'applicationPackSent',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.microchipNumberRecorded).toEqual(expect.objectContaining({
      key: 'microchipNumberRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.applicationFeePaid).toEqual(expect.objectContaining({
      key: 'applicationFeePaid',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.form2Sent).toEqual(expect.objectContaining({
      key: 'form2Sent',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.cdoSummary).toEqual({
      applicationPackSent: undefined,
      insuranceCompany: undefined,
      insuranceRenewalDate: undefined,
      microchipNumber: undefined,
      applicationFeePaid: undefined,
      form2Sent: undefined,
      neuteringConfirmation: undefined,
      microchipVerification: undefined,
      certificateIssued: undefined
    })
  })

  test('should show task list given application has been sent', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25')
    })
    const cdo = buildCdo({
      exemption: exemptionProperties,
      dog: buildCdoDog({ microchipNumber: '' })
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.applicationPackSent).toEqual(new CdoTask('applicationPackSent', {
      available: true,
      completed: true,
      readonly: true
    }, new Date('2024-06-25')))
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(buildTask({
      key: 'insuranceDetailsRecorded',
      available: true
    }))
    expect(cdoTaskList.microchipNumberRecorded).toEqual(buildTask({
      key: 'microchipNumberRecorded',
      available: true
    }))
    expect(cdoTaskList.applicationFeePaid).toEqual(buildTask({
      key: 'applicationFeePaid',
      available: true
    }))
    expect(cdoTaskList.form2Sent).toEqual(buildTask({
      key: 'form2Sent',
      available: true
    }))
    expect(cdoTaskList.verificationDateRecorded).toEqual(buildTask({
      key: 'verificationDateRecorded'
    }))
    expect(cdoTaskList.certificateIssued).toEqual(buildTask({
      key: 'certificateIssued'
    }))
    expect(cdoTaskList.cdoSummary).toEqual({
      applicationPackSent: new Date('2024-06-25'),
      insuranceCompany: undefined,
      insuranceRenewalDate: undefined,
      microchipNumber: undefined,
      applicationFeePaid: undefined,
      form2Sent: undefined,
      neuteringConfirmation: undefined,
      microchipVerification: undefined,
      certificateIssued: undefined
    })
  })

  test('should show task list with record dates available given send form 2 has been recorded', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-06-25')
    })
    const cdo = buildCdo({
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)

    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.form2Sent).toEqual(expect.objectContaining({
      key: 'form2Sent',
      available: true,
      completed: true,
      readonly: true,
      timestamp: new Date('2024-06-25')
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should show task list with record dates unavailable given send form 2 has not been recorded', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      applicationFeePaid: new Date('2024-06-24'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: futureDate
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)

    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should show task list with record dates incomplete given microchipVerification complete but neuteringConfirmation not', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: futureDate
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)

    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should show task list with record dates incomplete given neuteringConfirmation complete but microchipVerification not', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: futureDate
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)

    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should not be completable given insurance renewal date is in the past', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: yesterday
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should not be completable given insurance company is set, but renewal is not', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: null
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should not be completable given insurance renewal is set, but company is not', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: null,
        insuranceRenewal: futureDate
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should return certificate issued as available given all other items are complete', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: new Date('2025-06-25')
      })]
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: true,
      completed: false,
      readonly: false,
      timestamp: undefined
    }))
  })

  test('should not have issue certificate btn available given all records are complete', () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: new Date('2024-06-25'),
      formTwoSent: new Date('2024-05-24'),
      applicationFeePaid: new Date('2024-06-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      insurance: [buildCdoInsurance({
        company: 'Dogs R Us',
        insuranceRenewal: futureDate
      })],
      certificateIssued: new Date('2024-06-27')
    })
    const dogProperties = buildCdoDog({
      microchipNumber: '123456789012345'
    })
    const cdo = buildCdo({
      dog: dogProperties,
      exemption: exemptionProperties
    })
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList.applicationPackSent).toEqual(new CdoTask('applicationPackSent', {
      available: true,
      completed: true,
      readonly: true
    }, new Date('2024-06-25')))
    expect(cdoTaskList.insuranceDetailsRecorded).toEqual(expect.objectContaining({
      key: 'insuranceDetailsRecorded',
      available: true,
      completed: true,
      readonly: false,
      timestamp: futureDate
    }))
    expect(cdoTaskList.microchipNumberRecorded).toEqual(expect.objectContaining({
      key: 'microchipNumberRecorded',
      available: true,
      completed: true,
      readonly: false,
      timestamp: undefined
    }))
    expect(cdoTaskList.applicationFeePaid).toEqual(expect.objectContaining({
      key: 'applicationFeePaid',
      available: true,
      completed: true,
      readonly: false,
      timestamp: new Date('2024-06-24')
    }))

    expect(cdoTaskList.form2Sent).toEqual(expect.objectContaining({
      key: 'form2Sent',
      available: true,
      completed: true,
      readonly: true,
      timestamp: new Date('2024-05-24')
    }))

    expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
      key: 'verificationDateRecorded',
      available: true,
      completed: true,
      readonly: false,
      timestamp: new Date('2024-03-09')
    }))

    expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
      key: 'certificateIssued',
      available: false,
      completed: true,
      readonly: false,
      timestamp: new Date('2024-06-27')
    }))

    expect(cdoTaskList.cdoSummary).toEqual({
      applicationPackSent: new Date('2024-06-25'),
      insuranceCompany: 'Dogs R Us',
      insuranceRenewalDate: futureDate,
      microchipNumber: '123456789012345',
      applicationFeePaid: new Date('2024-06-24'),
      form2Sent: new Date('2024-05-24'),
      neuteringConfirmation: new Date('2024-02-10'),
      microchipVerification: new Date('2024-03-09'),
      certificateIssued: new Date('2024-06-27')
    })
  })
})
