const { CdoTaskList, Cdo, CdoTask } = require('../../../../../app/data/domain')
const { buildCdo, buildExemption, buildTask, buildCdoInsurance, buildCdoDog, checkTask } = require('../../../../mocks/cdo/domain')
const { ActionAlreadyPerformedError } = require('../../../../../app/errors/domain/actionAlreadyPerformed')
const { SequenceViolationError } = require('../../../../../app/errors/domain/sequenceViolation')
const { inXDays } = require('../../../../time-helper')

describe('CdoTaskList', () => {
  const dogsTrustCompany = 'Dog\'s Trust'
  const today = new Date()
  const thisMorning = new Date()
  thisMorning.setHours(0, 0, 0, 0)
  const in60Days = inXDays(60)

  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

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
      expect(cdoTaskList.applicationPackProcessed).toEqual(expect.objectContaining({
        key: 'applicationPackProcessed',
        available: false,
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
        dogName: 'Rex300',
        cdoExpiry: new Date('2023-12-10'),
        applicationPackSent: undefined,
        insuranceCompany: undefined,
        insuranceRenewal: undefined,
        microchipNumber: undefined,
        microchipNumber2: undefined,
        applicationFeePaid: undefined,
        form2Sent: undefined,
        neuteringConfirmation: undefined,
        microchipVerification: undefined,
        certificateIssued: undefined,
        ownerFirstName: 'Alex',
        ownerLastName: 'Carter',
        status: 'Pre-exempt',
        addressLine1: '300 Anywhere St',
        addressLine2: 'Anywhere Estate',
        postcode: 'S1 1AA',
        town: 'City of London'
      })
    })

    test('should show task list given application has been sent', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25')
      })
      const cdo = buildCdo({
        exemption: exemptionProperties,
        dog: buildCdoDog({ microchipNumber: '', microchipNumber2: '' })
      })
      const cdoTaskList = new CdoTaskList(cdo)
      expect(cdoTaskList.applicationPackSent.key).toBe('applicationPackSent')
      expect(cdoTaskList.applicationPackSent.completed).toBe(true)
      expect(cdoTaskList.applicationPackSent.available).toBe(true)
      expect(cdoTaskList.applicationPackSent.readonly).toBe(true)
      expect(cdoTaskList.applicationPackSent.timestamp).toEqual(new Date('2024-06-25'))
      checkTask(expect, cdoTaskList.applicationPackProcessed, {
        key: 'applicationPackProcessed',
        available: true
      })
      checkTask(expect, cdoTaskList.insuranceDetailsRecorded, {
        key: 'insuranceDetailsRecorded',
        available: true
      })
      checkTask(expect, cdoTaskList.microchipNumberRecorded, {
        key: 'microchipNumberRecorded',
        available: true
      })
      checkTask(expect, cdoTaskList.applicationFeePaid, {
        key: 'applicationFeePaid',
        available: true
      })
      checkTask(expect, cdoTaskList.form2Sent, {
        key: 'form2Sent',
        available: true
      })
      expect(cdoTaskList.verificationDateRecorded.key).toBe('verificationDateRecorded')
      expect(cdoTaskList.verificationDateRecorded.available).toBe(true)
      expect(cdoTaskList.verificationDateRecorded.completed).toBe(false)
      expect(cdoTaskList.verificationDateRecorded.readonly).toBe(false)
      expect(cdoTaskList.verificationDateRecorded.timestamp).toBe(undefined)
      expect(cdoTaskList.certificateIssued).toEqual(buildTask({
        key: 'certificateIssued'
      }))
      expect(cdoTaskList.cdoSummary).toEqual({
        id: 300097,
        indexNumber: 'ED300097',
        applicationPackSent: new Date('2024-06-25'),
        dogName: 'Rex300',
        cdoExpiry: new Date('2023-12-10'),
        ownerFirstName: 'Alex',
        ownerLastName: 'Carter',
        insuranceCompany: undefined,
        insuranceRenewal: undefined,
        microchipNumber: undefined,
        applicationFeePaid: undefined,
        form2Sent: undefined,
        neuteringConfirmation: undefined,
        microchipVerification: undefined,
        certificateIssued: undefined,
        status: 'Interim exempt',
        addressLine1: '300 Anywhere St',
        addressLine2: 'Anywhere Estate',
        postcode: 'S1 1AA',
        town: 'City of London'
      })
    })

    test('should show task list with record dates available given application pack has been recorded', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25')
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

      expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
        key: 'certificateIssued',
        available: false,
        completed: false,
        readonly: false,
        timestamp: undefined
      }))
    })

    test('should show task list with record dates available irrespective of send form 2 has not been recorded', () => {
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
        applicationPackProcessed: new Date('2024-06-25'),
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
        applicationPackProcessed: new Date('2024-06-25'),
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

    test('should not return certificate issued as available given application pack has not been processed', () => {
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
        available: false,
        completed: false,
        readonly: false,
        timestamp: undefined
      }))

      expect(cdoTaskList.applicationPackProcessed).toEqual(expect.objectContaining({
        key: 'applicationPackProcessed',
        available: true,
        completed: false,
        readonly: false,
        timestamp: undefined
      }))
    })

    test('should not have issue certificate btn available given all records are complete', () => {
      const exemptionProperties = buildExemption({
        applicationPackSent: new Date('2024-06-25'),
        applicationPackProcessed: new Date('2024-06-25'),
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        microchipNumberRecorded: new Date('2024-08-07'),
        applicationFeePaymentRecorded: new Date('2024-08-07'),
        verificationDatesRecorded: new Date('2024-08-07'),
        microchipDeadline: new Date('2024-08-07'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          renewalDate: in60Days
        })],
        certificateIssued: new Date('2024-06-27')
      })
      const dogProperties = buildCdoDog({
        microchipNumber: '123456789012345',
        microchipNumber2: '123456789012346'
      })
      const cdo = buildCdo({
        dog: dogProperties,
        exemption: exemptionProperties
      })
      const cdoTaskList = new CdoTaskList(cdo)
      checkTask(expect, cdoTaskList.applicationPackSent, {
        key: 'applicationPackSent',
        available: true,
        completed: true,
        readonly: true,
        timestamp: new Date('2024-06-25')
      })
      checkTask(expect, cdoTaskList.applicationPackProcessed, new CdoTask('applicationPackProcessed', {
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
      checkTask(expect, cdoTaskList.applicationFeePaid, {
        key: 'applicationFeePaid',
        available: true,
        completed: true,
        readonly: false,
        timestamp: new Date('2024-06-24')
      })

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
        dogName: 'Rex300',
        ownerFirstName: 'Alex',
        ownerLastName: 'Carter',
        cdoExpiry: new Date('2023-12-10'),
        applicationPackSent: new Date('2024-06-25'),
        applicationPackProcessed: new Date('2024-06-25'),
        insuranceCompany: 'Dogs R Us',
        insuranceRenewal: in60Days,
        microchipNumber: '123456789012345',
        microchipNumber2: '123456789012346',
        applicationFeePaid: new Date('2024-06-24'),
        form2Sent: new Date('2024-05-24'),
        neuteringConfirmation: new Date('2024-02-10'),
        microchipVerification: new Date('2024-03-09'),
        microchipDeadline: new Date('2024-08-07'),
        certificateIssued: new Date('2024-06-27'),
        status: 'Interim exempt',
        addressLine1: '300 Anywhere St',
        addressLine2: 'Anywhere Estate',
        postcode: 'S1 1AA',
        town: 'City of London'
      })
    })
  })

  describe('steps', () => {
    const transactionCallback = jest.fn()
    const cdoTaskList = buildDefaultTaskList()
    let exemptionSteps = 0
    let dogSteps = 0
    let transactionNumber = 0

    test('should not permit recording of Insurance Details before application pack is sent', async () => {
      expect(() => cdoTaskList.processApplicationPack(new Date(), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.recordInsuranceDetails(dogsTrustCompany, inXDays(60), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.recordMicrochipNumber('123456789012345', null, transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.recordApplicationFee(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.sendForm2(new Date('2024-07-04'), transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      expect(() => cdoTaskList.verifyDates({ microchipVerification: new Date('2024-07-04'), neuteringConfirmation: new Date('2024-07-04') }, transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))
      await expect(cdoTaskList.sendReplacementCertificate(transactionCallback)).rejects.toThrow(new SequenceViolationError('Replacement certificate cannot be sent until certificate has been issued'))

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
      expect(() => cdoTaskListWithMicrochipNumber.verifyDates({ microchipVerification: new Date('2024-07-04'), neuteringConfirmation: new Date('2024-07-04') }, transactionCallback)).toThrow(new SequenceViolationError('Application pack must be sent before performing this action'))

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

        expect(exemptionSteps).toBe(0)
        cdoTaskList.getUpdates().exemption[exemptionSteps++].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
      })

      test('should fail if application pack has already been sent', () => {
        expect(() => cdoTaskList.sendApplicationPack(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Application pack can only be sent once'))
      })
    })

    describe('processApplicationPack', () => {
      test('should process application pack given applicationPackProcessed is not complete', () => {
        const sentDate = new Date()
        expect(cdoTaskList.applicationPackProcessed.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.applicationPackProcessed).not.toBeInstanceOf(Date)

        cdoTaskList.processApplicationPack(sentDate, transactionCallback)
        expect(cdoTaskList.applicationPackProcessed.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.applicationPackProcessed).toBeInstanceOf(Date)
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps]).toEqual({
          key: 'applicationPackProcessed',
          value: sentDate,
          callback: expect.any(Function)
        })
        expect(exemptionSteps).toBe(1)
        cdoTaskList.getUpdates().exemption[exemptionSteps++].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
      })

      test('should fail if application pack has already been proceseed', () => {
        expect(() => cdoTaskList.processApplicationPack(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Application pack can only be processed once'))
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
        expect(exemptionSteps).toBe(2)
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps++]).toEqual({
          key: 'insuranceDetailsRecorded',
          value: expect.any(Date)
        })
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps]).toEqual({
          key: 'insurance',
          value: {
            company: dogsTrustCompany,
            renewalDate: expect.any(Date)
          },
          callback: expect.any(Function)
        })
        cdoTaskList.getUpdates().exemption[exemptionSteps++].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
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
        expect(exemptionSteps).toBe(4)
        cdoTaskList.getUpdates().dog[dogSteps++].callback()
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps++]).toEqual({
          key: 'microchipNumberRecorded',
          value: expect.any(Date)
        })
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
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
        expect(exemptionSteps).toBe(5)
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps++]).toEqual({
          key: 'applicationFeePaymentRecorded',
          value: expect.any(Date)
        })
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps]).toEqual({
          key: 'applicationFeePaid',
          value: expect.any(Date),
          callback: expect.any(Function)
        })
        cdoTaskList.getUpdates().exemption[exemptionSteps++].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
      })
    })

    test('should not permit verification of Dates before Form 2 is sent', () => {
      expect(() => cdoTaskList.verifyDates({ microchipVerification: new Date('2024-07-04'), neuteringConfirmation: new Date('2024-07-04') }, transactionCallback)).toThrow(new SequenceViolationError('Form 2 must be sent before performing this action'))
    })

    describe('sendForm2', () => {
      test('should send application pack given sendForm2 is not complete', () => {
        const sentDate = new Date()
        expect(cdoTaskList.form2Sent.completed).toBe(false)
        expect(cdoTaskList.cdoSummary.form2Sent).not.toBeInstanceOf(Date)

        cdoTaskList.sendForm2(sentDate, transactionCallback)
        expect(cdoTaskList.form2Sent.completed).toBe(true)
        expect(cdoTaskList.cdoSummary.form2Sent).toEqual(sentDate)
        expect(cdoTaskList.getUpdates().exemption[exemptionSteps]).toEqual({
          key: 'form2Sent',
          value: sentDate,
          callback: transactionCallback
        })
        cdoTaskList.getUpdates().exemption[exemptionSteps++].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
      })

      test('should fail if sendForm2  has already been sent', () => {
        expect(() => cdoTaskList.sendForm2(new Date(), transactionCallback)).toThrow(new ActionAlreadyPerformedError('Form 2 can only be sent once'))
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
        cdoTaskList.verifyDates({ microchipVerification, neuteringConfirmation }, () => transactionCallback)
        expect(cdoTaskList.cdoSummary.microchipVerification).toEqual(microchipVerification)
        expect(cdoTaskList.cdoSummary.neuteringConfirmation).toEqual(neuteringConfirmation)
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(true)
        expect(cdoTaskList.verificationDateRecorded.timestamp).toEqual(expect.any(Date))
        cdoTaskList.getUpdates().exemption[exemptionSteps].callback()
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
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
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
      })
    })

    describe('sendReplacementCertificate', () => {
      test('should send replacement certificate', async () => {
        const date = await cdoTaskList.sendReplacementCertificate(transactionCallback)
        expect(transactionCallback).toHaveBeenCalledTimes(++transactionNumber)
        expect(date).toBeInstanceOf(Date)
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

  describe('6th Si', () => {
    const sixteenMonthsAgo = new Date(today)
    sixteenMonthsAgo.setUTCHours(0, 0, 0, 0)
    sixteenMonthsAgo.setUTCMonth(today.getMonth() - 16)

    const lessThanSixteenMonthsAgo = new Date(sixteenMonthsAgo)
    lessThanSixteenMonthsAgo.setUTCDate(lessThanSixteenMonthsAgo.getUTCDate() + 1)

    const inTheFuture = new Date(today)
    inTheFuture.setUTCFullYear(inTheFuture.getUTCFullYear() + 1)

    const buildExemptionWithBase = exemptionPartial => {
      return buildExemption({
        exemptionOrder: '2015',
        applicationPackSent: new Date('2024-06-25'),
        applicationPackProcessed: new Date('2024-06-25'),
        form2Sent: new Date('2024-05-24'),
        applicationFeePaid: new Date('2024-06-24'),
        neuteringConfirmation: new Date('2024-03-09'),
        microchipVerification: new Date('2024-03-09'),
        insuranceDetailsRecorded: new Date('2024-08-07'),
        microchipNumberRecorded: undefined,
        verificationDatesRecorded: new Date('2024-08-07'),
        insurance: [buildCdoInsurance({
          company: 'Dogs R Us',
          renewalDate: new Date('2025-06-25')
        })],
        ...exemptionPartial
      })
    }

    const buildDogWithBase = dogPartial => {
      return buildCdoDog({
        dateOfBirth: lessThanSixteenMonthsAgo,
        breed: 'XL Bully',
        ...dogPartial
      })
    }

    /**
     * @param {{ exemptionPartial?: Partial<Exemption>; dogPartial?: Partial<CdoDogParams>}} partials
     * @return {CdoTaskList}
     */
    const buildCdoWithBase = ({ exemptionPartial = {}, dogPartial = {} } = {}) => {
      const exemptionProperties = buildExemptionWithBase(exemptionPartial)
      const dogProperties = buildDogWithBase(dogPartial)

      const cdo = buildCdo({
        dog: dogProperties,
        exemption: exemptionProperties
      })
      return new CdoTaskList(cdo)
    }
    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('verification step complete given verificationDatesRecorded & neuteringConfirmation=undefined', () => {
      const verificationCompletedTest = (cdoTaskList, completed = true) => {
        expect(cdoTaskList.verificationDateRecorded).toEqual(expect.objectContaining({
          key: 'verificationDateRecorded',
          available: true,
          completed,
          readonly: false,
          timestamp: completed ? new Date('2024-08-07') : undefined
        }))
        expect(cdoTaskList.certificateIssued).toEqual(expect.objectContaining({
          key: 'certificateIssued',
          available: completed,
          completed: false,
          readonly: false,
          timestamp: undefined
        }))
      }

      const verificationIsComplete = (cdoTaskList) => verificationCompletedTest(cdoTaskList, true)
      const verificationIsNotComplete = (cdoTaskList) => verificationCompletedTest(cdoTaskList, false)

      describe('2015 dog', () => {
        describe('given dog under 16 months as of CDO Issued date', () => {
          test('should return true given verificationDatesRecorded, microchipDeadline and neuteringDeadline recorded', () => {
          // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
            const cdoTaskList = buildCdoWithBase({
              exemptionPartial: {
                microchipVerification: undefined,
                microchipDeadline: tomorrow,
                neuteringConfirmation: undefined,
                neuteringDeadline: tomorrow
              }
            })
            verificationIsComplete(cdoTaskList)
          })

          test('should return true given verificationDatesRecorded and microchipDeadline recorded', () => {
          // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
            const cdoTaskList = buildCdoWithBase({
              exemptionPartial: {
                microchipVerification: undefined,
                microchipDeadline: tomorrow
              }
            })
            verificationIsComplete(cdoTaskList)
          })

          test('should not return true given microchipDeadline recorded but dog is not XL Bully', () => {
          // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
            const cdoTaskList = buildCdoWithBase({
              exemptionPartial: {
                microchipVerification: undefined,
                microchipDeadline: tomorrow,
                exemptionOrder: '1991'
              }
            })
            verificationIsNotComplete(cdoTaskList)
          })

          describe('neutering confirmation undefined', () => {
            test('should be false given Dog is not an XL Bully', () => {
              const cdoTaskList = buildCdoWithBase({
                dogPartial: { breed: 'Japanese Tosa' },
                exemptionPartial: {
                  microchipVerification: new Date(),
                  neuteringConfirmation: undefined,
                  neuteringDeadline: tomorrow
                }
              })
              verificationIsNotComplete(cdoTaskList)
            })
            test('should return false given Dog has no date of birth', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { neuteringConfirmation: undefined, neuteringDeadline: tomorrow },
                dogPartial: { dateOfBirth: undefined }
              })
              verificationIsNotComplete(cdoTaskList)
            })

            test('should return false given verificationDatesRecorded and neuteringDeadline today', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { neuteringConfirmation: undefined, neuteringDeadline: new Date() }
              })
              verificationIsNotComplete(cdoTaskList)
            })

            test('should return false given and neutering deadline not set', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { neuteringConfirmation: undefined, neuteringDeadline: undefined }
              })
              verificationIsNotComplete(cdoTaskList)
            })
          })

          describe('microchipVerification undefined', () => {
            test('should return false given verificationDatesRecorded and microchipDeadline today', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { microchipVerification: undefined, microchipDeadline: thisMorning }
              })
              verificationIsNotComplete(cdoTaskList)
            })

            test('should return true given verificationDatesRecorded and microchipDeadline in the future', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { microchipVerification: undefined, microchipDeadline: inTheFuture }
              })
              verificationIsComplete(cdoTaskList)
            })
            test('should return false given and microchip not verified', () => {
            // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
              const cdoTaskList = buildCdoWithBase({
                exemptionPartial: { microchipVerification: undefined }
              })
              verificationIsNotComplete(cdoTaskList)
            })
          })

          test('should return false given verification Dates not Recorded', () => {
          // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
            const cdoTaskList = buildCdoWithBase({
              exemptionPartial: {
                neuteringConfirmation: undefined,
                neuteringDeadline: inTheFuture,
                microchipVerification: undefined,
                microchipDeadline: inTheFuture,
                verificationDatesRecorded: undefined
              }
            })
            verificationIsNotComplete(cdoTaskList)
          })
        })

        test('should return false given dog 16 months old and microchip selected', () => {
        // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
          const cdoTaskList = buildCdoWithBase({
            dogPartial: { dateOfBirth: sixteenMonthsAgo },
            exemptionPartial: { neuteringConfirmation: undefined, neuteringDeadline: inTheFuture, cdoIssued: today }
          })
          verificationIsNotComplete(cdoTaskList)
        })
      })

      test('should return false if not 2015 Dog', () => {
      // 2015 XL Bully, exemption DOB < 16 months, dog's neutering not verified, neutering deadline set
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipDeadline: tomorrow,
            exemptionOrder: '2023',
            microchipVerification: undefined
          }
        })
        expect(cdoTaskList.verificationDateRecorded.available).toBe(true)
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(false)
        expect(cdoTaskList.verificationDateRecorded.timestamp).toBe(undefined)
        expect(cdoTaskList.verificationDateRecorded.readonly).toBe(false)
      })
    })

    describe('verify Dates', () => {
      const microchipVerification = new Date('2024-11-26')
      const neuteringConfirmation = new Date('2024-11-26')
      const microchipDeadline = new Date(`${today.getUTCFullYear() + 1}-11-26`)
      const callback = jest.fn()

      test('should handle neutering confirmation dogNotNeutered', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            neuteringConfirmation: undefined
          },
          dogPartial: { dateOfBirth: new Date() }
        })

        cdoTaskList.verifyDates({ microchipVerification, dogNotNeutered: true }, callback)
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(true)
        expect(cdoTaskList.verificationDateRecorded.timestamp).toEqual(expect.any(Date))
        expect(cdoTaskList.cdoSummary.neuteringDeadline).toEqual(expect.any(Date))
        expect(cdoTaskList.cdoSummary.microchipDeadline).toBeUndefined()
      })

      test('should handle Dog not fit for microchipping', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            neuteringConfirmation: undefined
          },
          dogPartial: { dateOfBirth: new Date() }
        })

        cdoTaskList.verifyDates({ neuteringConfirmation, dogNotFitForMicrochip: true, microchipDeadline }, callback)
        expect(cdoTaskList.verificationDateRecorded.completed).toBe(true)
        expect(cdoTaskList.verificationDateRecorded.timestamp).toEqual(expect.any(Date))
        expect(cdoTaskList.cdoSummary.microchipDeadline).toEqual(expect.any(Date))
        expect(cdoTaskList.cdoSummary.neuteringDeadline).toBeUndefined()
      })
    })

    describe('verificationOptions', () => {
      test('should allow Dog declared unfit and neutering bypass given 2015 and Dog under 16 months as of CDO issued date', () => {
        const cdoTaskList = buildCdoWithBase({
          dogPartial: {
            dateOfBirth: new Date('2023-07-01')
          },
          exemptionPartial: {
            cdoIssued: new Date('2024-10-01'),
            verificationDatesRecorded: undefined,
            microchipVerification: undefined,
            neuteringConfirmation: undefined
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: true,
          showNeuteringBypass: true
        })
      })

      test('should allow Dog declared unfit if Dog is 2015 Dog', () => {
        const cdoTaskList = buildCdoWithBase({
          dogPartial: {
            breed: 'Pit Bull Terrier',
            name: undefined
          },
          exemptionPartial: {
            verificationDatesRecorded: undefined,
            microchipVerification: undefined,
            neuteringConfirmation: undefined
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: false,
          showNeuteringBypass: false
        })
      })

      test('should not allow dog not neutered if Dog over 16 months as of CDO Issue Date', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            cdoIssued: new Date('2024-11-29'),
            microchipVerification: undefined,
            neuteringConfirmation: undefined,
            verificationDatesRecorded: undefined
          },
          dogPartial: {
            dateOfBirth: new Date('2023-07-01')
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: false,
          showNeuteringBypass: false
        })
      })

      test('should not allow Dog declared unfit for microchip or neutering bypass given non-2015 dog', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            exemptionOrder: '1991',
            verificationDatesRecorded: undefined,
            microchipVerification: undefined,
            neuteringConfirmation: undefined
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: false,
          allowNeuteringBypass: false,
          showNeuteringBypass: false
        })
      })

      test('should pre-select Dog declared unfit for microchip and neutering bypassed given called', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            microchipDeadline: tomorrow,
            neuteringConfirmation: undefined,
            neuteringDeadline: tomorrow
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: true,
          neuteringBypassedUnder16: true,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: true,
          showNeuteringBypass: true
        })
      })

      test('should not pre-select Dog declared unfit for microchip and neutering bypassed given date set', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: new Date(),
            neuteringConfirmation: new Date()
          }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: true,
          showNeuteringBypass: true
        })
      })

      test('should not allow neutering delay if Dog is not an XL Bully', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            neuteringConfirmation: undefined,
            verificationDatesRecorded: undefined
          },
          dogPartial: { breed: 'Pit Bull Terrier' }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: false,
          showNeuteringBypass: false
        })
      })

      test('should hide dog under 16 and not neutered if no dob', () => {
        const cdoTaskList = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            neuteringConfirmation: undefined,
            verificationDatesRecorded: undefined
          },
          dogPartial: { dateOfBirth: undefined }
        })
        expect(cdoTaskList.verificationOptions).toEqual({
          dogDeclaredUnfit: false,
          neuteringBypassedUnder16: false,
          allowDogDeclaredUnfit: true,
          allowNeuteringBypass: false,
          showNeuteringBypass: true
        })
      })
    })

    describe('microchipRulesPassed', () => {
      test('should pass if deadline is tomorrow', () => {
        const cdoTasklist = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            microchipDeadline: tomorrow
          }
        })
        expect(cdoTasklist.microchipRulesPassed).toBe(true)
      })

      test('should not pass if deadline is today', () => {
        const cdoTasklist = buildCdoWithBase({
          exemptionPartial: {
            microchipVerification: undefined,
            microchipDeadline: today
          }
        })
        expect(cdoTasklist.microchipRulesPassed).toBe(false)
      })
    })

    describe('neuteringRulesPassed', () => {
      test('should pass if deadline is tomorrow', () => {
        const cdoTasklist = buildCdoWithBase({
          exemptionPartial: {
            neuteringConfirmation: undefined,
            neuteringDeadline: tomorrow
          }
        })
        expect(cdoTasklist.neuteringRulesPassed).toBe(true)
      })

      test('should not pass if deadline is today', () => {
        const cdoTasklist = buildCdoWithBase({
          exemptionPartial: {
            neuteringConfirmation: undefined,
            neuteringDeadline: today
          }
        })
        expect(cdoTasklist.neuteringRulesPassed).toBe(false)
      })
    })

    describe('can complete', () => {
      test('should return certificate issued as available given all other items are complete and microchip deadline exists - for 2015 Bully', () => {
        const exemptionProperties = buildExemption({
          applicationPackSent: new Date('2024-06-25'),
          applicationPackProcessed: new Date('2024-06-25'),
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
    })
  })
})
