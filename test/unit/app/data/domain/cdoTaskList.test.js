const { CdoTaskList, Cdo, CdoTask } = require('../../../../../app/data/domain')
const { buildCdo, buildExemption, buildTask, buildCdoInsurance, buildCdoDog } = require('../../../../mocks/cdo/domain')
const { ActionAlreadyPerformedError } = require('../../../../../app/errors/domain/actionAlreadyPerformed')
const { SequenceViolationError } = require('../../../../../app/errors/domain/sequenceViolation')
const { inXDays } = require('../../../../time-helper')
describe('CdoTaskList', () => {
  const dogsTrustCompany = 'Dog\'s Trust'

  const in60Days = inXDays(60)

  const buildDefaultTaskList = () => {
    const exemptionProperties = buildExemption({
      applicationPackSent: null
    })
    const cdo = buildCdo({
      exemption: exemptionProperties
    })
    return new CdoTaskList(cdo)
  }

  test('should instantiate ', () => {
    const cdo = buildCdo()
    const cdoTaskList = new CdoTaskList(cdo)
    expect(cdoTaskList._cdo).toBeInstanceOf(Cdo)
  })

  describe('Task List', () => {
    test('should show applicationPackSent in default state', () => {
      const cdoTaskList = buildDefaultTaskList()
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
        id: 300097,
        indexNumber: 'ED300097',
        applicationPackSent: undefined,
        insuranceCompany: undefined,
        insuranceRenewal: undefined,
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
        id: 300097,
        indexNumber: 'ED300097',
        applicationPackSent: new Date('2024-06-25'),
        insuranceCompany: undefined,
        insuranceRenewal: undefined,
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
          insuranceRenewal: in60Days
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
          insuranceRenewal: in60Days
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
          insuranceRenewal: in60Days
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

    test('should be completable given insurance renewal date is today', () => {
      const today = new Date()
      today.setHours(0)
      today.setMinutes(0)
      today.setMilliseconds(0)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        formTwoSent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          renewalDate: today
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
          insuranceRenewal: in60Days
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
          renewalDate: new Date('2025-06-25')
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
          renewalDate: in60Days
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
        timestamp: in60Days
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
        id: 300097,
        indexNumber: 'ED300097',
        applicationPackSent: new Date('2024-06-25'),
        insuranceCompany: 'Dogs R Us',
        insuranceRenewal: in60Days,
        microchipNumber: '123456789012345',
        applicationFeePaid: new Date('2024-06-24'),
        form2Sent: new Date('2024-05-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        certificateIssued: new Date('2024-06-27')
      })
    })
  })

  describe('steps', () => {
    const transactionCallback = jest.fn()
    const cdoTaskList = buildDefaultTaskList()

    test('should not permit recording of Insurance Details before application pack is sent', () => {
      expect(() => cdoTaskList.recordInsuranceDetails(dogsTrustCompany, inXDays(60), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.recordMicrochipNumber('123456789012345', null, transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.recordApplicationFee(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.sendForm2(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))

      expect(cdoTaskList.insuranceDetailsRecorded.completed).toBe(false)
      expect(cdoTaskList.cdoSummary.insuranceCompany).toBeUndefined()
      expect(cdoTaskList.cdoSummary.insuranceRenewal).not.toBeInstanceOf(Date)
      expect(cdoTaskList.cdoSummary.microchipNumber).toBeUndefined()
    })

    describe('sendApplicationPack', () => {
      test('should send application pack given applicationPackSent is not complete', () => {
        const sentDate = new Date()
        expect(cdoTaskList.applicationPackSent.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.applicationPackSent).not.toBeInstanceOf(Date)

        cdoTaskList.sendApplicationPack(sentDate, transactionCallback)
        expect(cdoTaskList.applicationPackSent.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.applicationPackSent).toBeInstanceOf(Date)
        expect(cdoTaskList.getUpdates().exemption).toEqual([{
          key: 'applicationPackSent',
          value: sentDate,
          callback: expect.any(Function)
        }])
        cdoTaskList.getUpdates().exemption[0].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(1)
      })

      test('should fail if application pack has already been sent', () => {
        expect(() => cdoTaskList.sendApplicationPack(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Application pack can only be sent once'))
      })
    })

    describe('recordInsuranceDetails', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.insuranceDetailsRecorded.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.insuranceCompany).toBeUndefined()
        expect(cdoTaskList.cdoSummary.insuranceRenewal).not.toBeInstanceOf(Date)
      })

      test('should record insurance details given date is in the future', async () => {
        const renewalDate = inXDays(1)

        cdoTaskList.recordInsuranceDetails(dogsTrustCompany, renewalDate, transactionCallback)
        expect(cdoTaskList.insuranceDetailsRecorded.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.insuranceCompany).toBe(dogsTrustCompany)
        expect(cdoTaskList.cdoSummary.insuranceRenewal).toBeInstanceOf(Date)
        expect(cdoTaskList.getUpdates().exemption[1]).toEqual({
          key: 'insurance',
          value: {
            company: dogsTrustCompany,
            renewalDate: expect.any(Date)
          },
          callback: expect.any(Function)
        })
        cdoTaskList.getUpdates().exemption[1].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(2)
      })
    })

    describe('recordMicrochipNumber', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.microchipNumberRecorded.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.microchipNumber).toBeUndefined()
      })

      test('should record microchip number', () => {
        cdoTaskList.recordMicrochipNumber('123456789012345', null, transactionCallback)
        expect(cdoTaskList.cdoSummary.microchipNumber).toEqual('123456789012345')
        cdoTaskList.getUpdates().dog[0].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(3)
      })
    })

    describe('recordApplicationFee', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.applicationFeePaid.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.applicationFeePaid).toBeUndefined()
      })

      test('should record Application Fee', () => {
        const applicationFeePaid = new Date('2024-07-03')
        cdoTaskList.recordApplicationFee(applicationFeePaid, transactionCallback)
        expect(cdoTaskList.cdoSummary.applicationFeePaid).toEqual(applicationFeePaid)
        cdoTaskList.getUpdates().exemption[0].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(4)
      })
    })

    describe('sendForm2', () => {
      test('should send application pack given sendForm2 is not complete', () => {
        const sentDate = new Date()
        expect(cdoTaskList.form2Sent.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.form2Sent).not.toBeInstanceOf(Date)

        cdoTaskList.sendForm2(sentDate, transactionCallback)
        expect(cdoTaskList.form2Sent.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.form2Sent).toEqual(sentDate)
        expect(cdoTaskList.getUpdates().exemption[3]).toEqual({
          key: 'formTwoSent',
          value: sentDate,
          callback: transactionCallback
        })
        cdoTaskList.getUpdates().exemption[3].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(5)
      })

      test('should fail if sendForm2  has already been sent', () => {
        expect(() => cdoTaskList.sendForm2(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Form Two can only be sent once'))
      })
    })
  })
})
