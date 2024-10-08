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
      exemption: exemptionProperties,
      dog: buildCdoDog({
        status: 'Pre-exempt'
      })
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
        certificateIssued: undefined,
        status: 'Pre-exempt'
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
        certificateIssued: undefined,
        status: 'Interim exempt'
      })
    })

    test('should show task list with record dates available given send form 2 has been recorded', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        form2Sent: new Date('2024-06-25')
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
        form2Sent: new Date('2024-05-24'),
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
        form2Sent: new Date('2024-05-24'),
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
        form2Sent: new Date('2024-05-24'),
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

    test('should not be completable given insurance renewal date is in the past', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 100)

      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: null,
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          insuranceRenewal: tomorrow
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
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        microchipNumberRecorded: new Date('2024-08-07'),
        verificationDatesRecorded: new Date('2024-08-07'),
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
        form2Sent: new Date('2024-05-24'),
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
        form2Sent: new Date('2024-05-24'),
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
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        microchipNumberRecorded: new Date('2024-08-07'),
        verificationDatesRecorded: new Date('2024-08-07'),
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
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        microchipNumberRecorded: new Date('2024-08-07'),
        applicationFeePaymentRecorded: new Date('2024-08-07'),
        verificationDatesRecorded: new Date('2024-08-07'),
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
        timestamp: new Date('2024-08-07')
      }))
      expect(cdoTaskList.microchipNumberRecorded).toEqual(expect.objectContaining({
        key: 'microchipNumberRecorded',
        available: true,
        completed: true,
        readonly: false,
        timestamp: expect.any(Date)
      }))
      expect(cdoTaskList.applicationFeePaid).toEqual(expect.objectContaining({
        key: 'applicationFeePaid',
        available: true,
        completed: true,
        readonly: false,
        timestamp: new Date('2024-08-07')
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
        timestamp: new Date('2024-08-07')
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
        certificateIssued: new Date('2024-06-27'),
        status: 'Interim exempt'
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
      expect(() => cdoTaskList.verifyDates(new Date('2024-07-04'), new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))

      expect(cdoTaskList.insuranceDetailsRecorded.completed).toBe(false)
      expect(cdoTaskList.cdoSummary.insuranceCompany).toBeUndefined()
      expect(cdoTaskList.cdoSummary.insuranceRenewal).not.toBeInstanceOf(Date)
      expect(cdoTaskList.cdoSummary.microchipNumber).toBeUndefined()
      expect(cdoTaskList.cdoSummary.microchipVerification).toBeUndefined()
      expect(cdoTaskList.cdoSummary.neuteringConfirmation).toBeUndefined()
    })

    test('should permit recording of Microchip before application pack is sent if it has already been set', () => {
      const microchipNumber = '123456789012345'
      const microchipVerification = new Date('2024-09-26')
      const exemptionProperties = buildExemption({
        applicationPackSent: null,
        microchipVerification
      })
      const cdo = buildCdo({
        exemption: exemptionProperties,
        dog: buildCdoDog({
          status: 'Pre-exempt',
          microchipNumber
        })
      })
      const cdoTaskListWithMicrochipNumber = new CdoTaskList(cdo)

      expect(() => cdoTaskListWithMicrochipNumber.recordInsuranceDetails(dogsTrustCompany, inXDays(60), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskListWithMicrochipNumber.recordMicrochipNumber('123456789012345', null, transactionCallback)).not.toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskListWithMicrochipNumber.recordApplicationFee(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskListWithMicrochipNumber.sendForm2(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskListWithMicrochipNumber.verifyDates(new Date('2024-07-04'), new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))

      expect(cdoTaskListWithMicrochipNumber.insuranceDetailsRecorded.completed).toBe(false)
      expect(cdoTaskListWithMicrochipNumber.cdoSummary.insuranceCompany).toBeUndefined()
      expect(cdoTaskListWithMicrochipNumber.cdoSummary.insuranceRenewal).not.toBeInstanceOf(Date)
      expect(cdoTaskListWithMicrochipNumber.cdoSummary.microchipNumber).toBe(microchipNumber)
      expect(cdoTaskListWithMicrochipNumber.cdoSummary.microchipVerification).toEqual(microchipVerification)
      expect(cdoTaskListWithMicrochipNumber.cdoSummary.neuteringConfirmation).toBeUndefined()
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
        expect(cdoTaskList.insuranceDetailsRecorded.timestamp).toEqual(expect.any(Date))
        expect(cdoTaskList.cdoSummary.insuranceCompany).toBe(dogsTrustCompany)
        expect(cdoTaskList.cdoSummary.insuranceRenewal).toBeInstanceOf(Date)
        expect(cdoTaskList.getUpdates().exemption[1]).toEqual({
          key: 'insuranceDetailsRecorded',
          value: expect.any(Date)
        })
        expect(cdoTaskList.getUpdates().exemption[2]).toEqual({
          key: 'insurance',
          value: {
            company: dogsTrustCompany,
            renewalDate: expect.any(Date)
          },
          callback: expect.any(Function)
        })
        cdoTaskList.getUpdates().exemption[2].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(2)
      })
    })

    describe('recordMicrochipNumber', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.microchipNumberRecorded.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.microchipNumber).toBeUndefined()
        expect(cdoTaskList.microchipNumberRecorded.timestamp).toBeUndefined()
      })

      test('should record microchip number', () => {
        cdoTaskList.recordMicrochipNumber('123456789012345', null, transactionCallback)
        expect(cdoTaskList.cdoSummary.microchipNumber).toEqual('123456789012345')
        expect(cdoTaskList.microchipNumberRecorded.timestamp).toEqual(expect.any(Date))
        cdoTaskList.getUpdates().dog[0].callback()
        expect(cdoTaskList.getUpdates().exemption[3]).toEqual({
          key: 'microchipNumberRecorded',
          value: expect.any(Date)
        })
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
        expect(cdoTaskList.applicationFeePaid.completed).toBe(true)
        expect(cdoTaskList.applicationFeePaid.timestamp).toEqual(expect.any(Date))
        cdoTaskList.getUpdates().exemption[5].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(4)
      })
    })

    test('should not permit verification of Dates before Form 2 is sent', () => {
      expect(() => cdoTaskList.verifyDates(new Date('2024-07-04'), new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Form 2 must be sent before performing this action'))
    })

    describe('sendForm2', () => {
      test('should send application pack given sendForm2 is not complete', () => {
        const sentDate = new Date()
        expect(cdoTaskList.form2Sent.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.form2Sent).not.toBeInstanceOf(Date)

        cdoTaskList.sendForm2(sentDate, transactionCallback)
        expect(cdoTaskList.form2Sent.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.form2Sent).toEqual(sentDate)
        expect(cdoTaskList.getUpdates().exemption[6]).toEqual({
          key: 'form2Sent',
          value: sentDate,
          callback: transactionCallback
        })
        cdoTaskList.getUpdates().exemption[6].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(5)
      })

      test('should fail if sendForm2  has already been sent', () => {
        expect(() => cdoTaskList.sendForm2(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Form Two can only be sent once'))
      })
    })

    test('should not permit issue of certificate before everything is complete', () => {
      expect(() => cdoTaskList.issueCertificate(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('CDO must be complete in order to issue certificate'))
    })

    describe('verifyDates', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.microchipVerification).toBeUndefined()
        expect(cdoTaskList.cdoSummary.neuteringConfirmation).toBeUndefined()
      })

      test('should record verification dates', () => {
        const microchipVerification = new Date('2024-07-03')
        const neuteringConfirmation = new Date('2024-07-03')
        cdoTaskList.verifyDates(microchipVerification, neuteringConfirmation, transactionCallback)
        expect(cdoTaskList.cdoSummary.microchipVerification).toEqual(microchipVerification)
        expect(cdoTaskList.cdoSummary.neuteringConfirmation).toEqual(neuteringConfirmation)
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(true)
        expect(cdoTaskList.verificationDateRecorded.timestamp).toEqual(expect.any(Date))
        cdoTaskList.getUpdates().exemption[0].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(6)
      })
    })

    describe('issueCertificate', () => {
      test('should start with correct details', () => {
        expect(cdoTaskList.certificateIssued.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.certificateIssued).toBeUndefined()
      })

      test('should issueCertificate', () => {
        const certificateIssued = new Date()
        cdoTaskList.issueCertificate(certificateIssued, transactionCallback)
        expect(cdoTaskList.cdoSummary.certificateIssued).toEqual(certificateIssued)
        cdoTaskList.getUpdates().exemption[0].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(7)
      })
    })

    describe('getters', () => {
      test('should get exemption', () => {
        const cdoTaskList = buildDefaultTaskList()
        expect(cdoTaskList.exemption.exemptionOrder).toBe('2015')
      })

      test('should get person', () => {
        const cdoTaskList = buildDefaultTaskList()
        expect(cdoTaskList.person.lastName).toBe('Carter')
      })

      test('should get dog', () => {
        const cdoTaskList = buildDefaultTaskList()
        expect(cdoTaskList.dog.indexNumber).toBe('ED300097')
      })
    })
  })
})
