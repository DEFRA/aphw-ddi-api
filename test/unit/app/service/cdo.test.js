const { buildCdo, buildExemption, buildCdoInsurance, buildCdoDog, buildCdoPerson, buildCdoPersonContactDetails } = require('../../../mocks/cdo/domain')
const { CdoTaskList, Cdo, Person, Dog, Exemption } = require('../../../../app/data/domain')
const { devUser } = require('../../../mocks/auth')
const { ActionAlreadyPerformedError } = require('../../../../app/errors/domain/actionAlreadyPerformed')
const { activities } = require('../../../../app/constants/event/events')

describe('CdoService', function () {
  /**
   * @type {CdoRepository}
   */
  let mockCdoRepository
  let cdoService

  jest.mock('../../../../app/repos/people')
  const { updatePersonEmail } = require('../../../../app/repos/people')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendActivityToAudit, sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  jest.mock('../../../../app/repos/activity')
  const { getActivityByLabel } = require('../../../../app/repos/activity')

  jest.mock('../../../../app/repos/microchip')
  const { microchipExists } = require('../../../../app/repos/microchip')

  jest.mock('../../../../app/lib/email-helper')
  const { sendForm2Emails, emailApplicationPack, postApplicationPack, sendCertificateByEmail } = require('../../../../app/lib/email-helper')

  const { CdoService } = require('../../../../app/service/cdo')

  beforeEach(function () {
    jest.clearAllMocks()

    // Create a mock CdoRepository
    /**
     * @type {CdoRepository}
     */
    mockCdoRepository = {
      getCdo: jest.fn(),
      getAllCdos: jest.fn(),
      getCdoModel: jest.fn(),
      getCdoTaskList: jest.fn(),
      getSummaryCdos: jest.fn(),
      createCdo: jest.fn(),
      saveCdoTaskList: jest.fn(),
      submitFormTwo: jest.fn()
    }

    // Instantiate CdoService with the mock repository
    cdoService = new CdoService(mockCdoRepository)
  })

  describe('getTaskList', function () {
    test('should call getCdo with the correct cdoId', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.getTaskList(cdoIndexNumber)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(result).toEqual(cdoTaskList)
    })
  })

  describe('emailApplicationPack', () => {
    const sentDate = new Date()
    const cdoIndexNumber = 'ED300097'

    // TODO: this will probably change
    const applicationPackEmailedEventLabel = { id: 9, label: 'Application pack' }
    getActivityByLabel.mockResolvedValue(applicationPackEmailedEventLabel)

    test('should email application pack', async () => {
      const person = new Person(buildCdoPerson({
        personReference: 'P-1234-56',
        contactDetails: {
          email: 'garrymcfadyen@hotmail.com'
        }
      }))
      const dog = new Dog(buildCdoDog())
      const exemption = new Exemption(buildExemption())
      const cdo = new Cdo(person, dog, exemption)
      const cdoTaskList = new CdoTaskList(cdo)

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.emailApplicationPack(cdoIndexNumber, 'garrymcfadyen@hotmail.com', false, sentDate, devUser)
      expect(getActivityByLabel).toHaveBeenCalledWith(activities.applicationPackEmailed)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(emailApplicationPack).toHaveBeenCalledWith(person, dog, devUser)
      // TODO: This will probably change
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 9,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Application pack sent to garrymcfadyen@hotmail.com'
      }, devUser)

      expect(updatePersonEmail).not.toHaveBeenCalled()
      sendActivityToAudit.mockClear()
    })

    test('should email application pack and update email given updateEmail email', async () => {
      const person = new Person(buildCdoPerson({
        personReference: 'P-1234-56',
        contactDetails: {
          email: 'garrymcfadyen@hotmail.com'
        }
      }))
      const dog = new Dog(buildCdoDog())
      const exemption = new Exemption(buildExemption())
      const cdo = new Cdo(person, dog, exemption)
      const cdoTaskList = new CdoTaskList(cdo)

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.emailApplicationPack(cdoIndexNumber, 'garrymcfadyen@hotmail.com', true, sentDate, devUser)
      expect(getActivityByLabel).toHaveBeenCalledWith(activities.applicationPackEmailed)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(emailApplicationPack).toHaveBeenCalledWith(person, dog, devUser)
      expect(updatePersonEmail).toHaveBeenCalledWith('P-1234-56', 'garrymcfadyen@hotmail.com', devUser)
      sendActivityToAudit.mockClear()
    })

    test('should email application pack and update email given empty email', async () => {
      const person = new Person(buildCdoPerson({
        personReference: 'P-1234-56'
      }))
      const dog = new Dog(buildCdoDog())
      const exemption = new Exemption(buildExemption())
      const cdo = new Cdo(person, dog, exemption)
      const cdoTaskList = new CdoTaskList(cdo)

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.emailApplicationPack(cdoIndexNumber, 'garrymcfadyen@hotmail.com', true, sentDate, devUser)
      expect(getActivityByLabel).toHaveBeenCalledWith(activities.applicationPackEmailed)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(emailApplicationPack).toHaveBeenCalledWith(person, dog, devUser)
      expect(updatePersonEmail).toHaveBeenCalledWith('P-1234-56', 'garrymcfadyen@hotmail.com', devUser)
      sendActivityToAudit.mockClear()
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.emailApplicationPack(cdoIndexNumber, sentDate, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('postApplicationPack', () => {
    const sentDate = new Date()
    const cdoIndexNumber = 'ED300097'

    // TODO: this will probably change
    const applicationPackPostedEventLabel = { id: 9, label: 'Application pack' }
    getActivityByLabel.mockResolvedValue(applicationPackPostedEventLabel)

    test('should post application pack', async () => {
      const person = new Person(buildCdoPerson({
        personReference: 'P-1234-56',
        firstName: 'Garry',
        lastName: 'McFadyen',
        contactDetails: buildCdoPersonContactDetails({
          address: {
            addressLine1: '122 Common Road',
            addressLine2: null,
            postcode: 'TN39 4JB',
            town: 'Bexhill-on-Sea',
            country: 'England'
          }
        })
      }))
      const dog = new Dog(buildCdoDog())
      const exemption = new Exemption(buildExemption())
      const cdo = new Cdo(person, dog, exemption)
      const cdoTaskList = new CdoTaskList(cdo)

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.postApplicationPack(cdoIndexNumber, sentDate, devUser)

      expect(getActivityByLabel).toHaveBeenCalledWith(activities.applicationPackPosted)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackSent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      // TODO: This will probably change
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 9,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Application pack sent to 122 Common Road, Bexhill-on-Sea, TN39 4JB'
      }, devUser)

      expect(postApplicationPack).toHaveBeenCalledWith(person, dog, devUser)
      sendActivityToAudit.mockClear()
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo())
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.postApplicationPack(cdoIndexNumber, sentDate, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('processApplicationPack', () => {
    test('should process application pack', async () => {
      getActivityByLabel.mockResolvedValue({ id: 9, label: 'Application pack' })
      const processedDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.processApplicationPack(cdoIndexNumber, processedDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'applicationPackProcessed',
        value: processedDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 9,
        activityType: 'processed',
        pk: 'ED300097',
        source: 'dog',
        activityDate: processedDate,
        targetPk: 'dog',
        activityLabel: 'Application pack'
      }, devUser)
      sendActivityToAudit.mockClear()
    })

    test('should not process an application pack a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03'),
          applicationPackProcessed: new Date('2024-05-03')
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.processApplicationPack(cdoIndexNumber, new Date(), devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.processApplicationPack(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('recordInsuranceDetails', () => {
    test('should record insurance details', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const inTheFuture = new Date('9999-01-01')

      const result = await cdoService.recordInsuranceDetails(cdoIndexNumber, {
        insuranceCompany: 'Dog\'s Trust',
        insuranceRenewal: inTheFuture
      }, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([
        {
          key: 'insuranceDetailsRecorded',
          value: expect.any(Date)
        },
        {
          key: 'insurance',
          value: {
            company: 'Dog\'s Trust',
            renewalDate: inTheFuture
          },
          callback: expect.any(Function)
        }])
      await cdoTaskList.getUpdates().exemption[1].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          insurance_company: null,
          insurance_renewal_date: null
        },
        {
          index_number: 'ED300097',
          insurance_company: "Dog's Trust",
          insurance_renewal_date: '9999-01-01'
        }, devUser)
    })
  })

  describe('recordMicrochipNumber', () => {
    test('should record microchip number', async () => {
      microchipExists.mockResolvedValue(null)

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const microchipNumber = '123456789012345'

      expect(cdoTaskList.microchipNumberRecorded.completed).toBe(false)

      const result = await cdoService.recordMicrochipNumber(cdoIndexNumber, {
        microchipNumber
      }, devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(microchipExists).toHaveBeenCalledWith(300097, '123456789012345')
      expect(cdoTaskList.microchipNumberRecorded.completed).toBe(true)
      expect(cdoTaskList.getUpdates().dog).toEqual([{
        key: 'microchip',
        value: microchipNumber,
        callback: expect.any(Function)
      }])

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      await cdoTaskList.getUpdates().dog[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          microchip1: null
        },
        {
          index_number: 'ED300097',
          microchip1: '123456789012345'
        }, devUser)
    })
  })

  describe('recordApplicationFee', () => {
    test('should record application fee', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const applicationFeePaid = new Date('2024-07-03')

      expect(cdoTaskList.applicationFeePaid.completed).toBe(false)

      const result = await cdoService.recordApplicationFee(
        cdoIndexNumber,
        {
          applicationFeePaid
        },
        devUser)

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(cdoTaskList.applicationFeePaid.completed).toBe(true)
      expect(cdoTaskList.getUpdates().exemption).toEqual([
        {
          key: 'applicationFeePaymentRecorded',
          value: expect.any(Date)
        },
        {
          key: 'applicationFeePaid',
          value: applicationFeePaid,
          callback: expect.any(Function)
        }])

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toEqual(cdoTaskList)
      await cdoTaskList.getUpdates().exemption[1].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          application_fee_paid: null
        },
        {
          index_number: 'ED300097',
          application_fee_paid: applicationFeePaid
        }, devUser)
    })
  })

  describe('sendForm2', () => {
    test('should send Form 2', async () => {
      getActivityByLabel.mockResolvedValue({ id: 10, label: 'Form 2' })
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.sendForm2(cdoIndexNumber, sentDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'form2Sent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 10,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Form 2 from Avon and Somerset Constabulary'
      }, devUser)
    })

    test('should send Form 2 even if police force is missing', async () => {
      getActivityByLabel.mockResolvedValue({ id: 10, label: 'Form 2' })
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          policeForce: undefined
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.sendForm2(cdoIndexNumber, sentDate, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'form2Sent',
        value: sentDate,
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 10,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: sentDate,
        targetPk: 'dog',
        activityLabel: 'Form 2 from Unknown force'
      }, devUser)
    })

    test('should not send Form 2 a second time', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date('2024-05-03'),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await expect(cdoService.sendForm2(cdoIndexNumber, new Date(), devUser)).rejects.toThrow(ActionAlreadyPerformedError)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.sendForm2(cdoIndexNumber, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('verifyDates', () => {
    test('should verifyDates', async () => {
      const microchipVerification = new Date('2024-07-03')
      const neuteringConfirmation = new Date('2024-07-03')

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification,
        neuteringConfirmation
      }, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'verificationDateRecorded',
        value: {
          microchipVerification,
          neuteringConfirmation,
          microchipDeadline: null,
          neuteringDeadline: null,
          verificationDatesRecorded: expect.any(Date)
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null,
          neutering_deadline: null,
          microchip_deadline: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification,
          neutering_deadline: null,
          microchip_deadline: null
        }, devUser)
    })

    test('should verifyDates given dogNotFitForMicrochip and dogNotNeutered', async () => {
      const microchipVerification = undefined
      const neuteringConfirmation = undefined
      const microchipDeadline = new Date(`${new Date().getUTCFullYear() + 1}-07-03`)

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        }),
        dog: buildCdoDog({ dateOfBirth: new Date() })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification,
        neuteringConfirmation,
        microchipDeadline,
        dogNotFitForMicrochip: true,
        dogNotNeutered: true
      }, devUser)

      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'verificationDateRecorded',
        value: {
          microchipVerification: null,
          neuteringConfirmation: null,
          verificationDatesRecorded: expect.any(Date),
          neuteringDeadline: expect.any(Date),
          microchipDeadline: expect.any(Date)
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[0].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null,
          neutering_deadline: null,
          microchip_deadline: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification,
          neutering_deadline: expect.any(Date),
          microchip_deadline: expect.any(Date)
        }, devUser)
    })

    test('should verifyDates but complete the Request Form 2 if not yet completed', async () => {
      const microchipVerification = new Date('2024-07-03')
      const neuteringConfirmation = new Date('2024-07-03')

      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification,
        neuteringConfirmation
      }, devUser)
      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'form2Sent',
        value: expect.any(Date),
        callback: undefined
      },
      {
        key: 'verificationDateRecorded',
        value: {
          microchipVerification,
          neuteringConfirmation,
          microchipDeadline: null,
          neuteringDeadline: null,
          verificationDatesRecorded: expect.any(Date)
        },
        callback: expect.any(Function)
      }])
      await cdoTaskList.getUpdates().exemption[1].callback()
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          neutering_confirmation: null,
          microchip_verification: null,
          neutering_deadline: null,
          microchip_deadline: null
        },
        {
          index_number: 'ED300097',
          neutering_confirmation: neuteringConfirmation,
          microchip_verification: microchipVerification,
          neutering_deadline: null,
          microchip_deadline: null
        }, devUser)
    })

    test('should handle repo error', async () => {
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date()
        })
      }))
      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockRejectedValue(new Error('error whilst saving'))

      await expect(cdoService.verifyDates(cdoIndexNumber, {
        microchipVerification: new Date(),
        neuteringConfirmation: new Date()
      }, devUser)).rejects.toThrow(new Error('error whilst saving'))
    })
  })

  describe('issueCertificate', () => {
    test('should issue certificate by post', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          personReference: 'P-8AD0-561A'
        }),
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser, { sendOption: 'post', firstCertificate: true })

      expect(updatePersonEmail).not.toHaveBeenCalled()
      expect(sendCertificateByEmail).not.toHaveBeenCalled()
    })

    test('should issue certificate by email', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser, { sendOption: 'email', email: 'me@test.com', certificateId: 'abc-123', firstCertificate: true })

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toBe(sentDate)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'certificateIssued',
        value: sentDate,
        callback: undefined
      }])

      await cdoTaskList.getUpdates().dog[0].callback()

      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          certificate_issued: undefined
        },
        {
          index_number: 'ED300097',
          certificate_issued: sentDate
        },
        devUser)
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: 'Pre-exempt'
        },
        {
          index_number: 'ED300097',
          status: 'Exempt'
        },
        devUser)

      expect(updatePersonEmail).not.toHaveBeenCalled()
      expect(sendCertificateByEmail).toHaveBeenCalledWith(cdoTaskList.person, cdoTaskList.dog, 'abc-123', 'me@test.com', true)
    })

    test('should send replacement certificate by email given not firstCertificate', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const certificateIssued = new Date('2025-01-26')
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          certificateIssued,
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Exempt'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser, { sendOption: 'email', email: 'me@test.com', certificateId: 'abc-123', firstCertificate: false })

      expect(mockCdoRepository.saveCdoTaskList).not.toHaveBeenCalled()
      expect(result).toBe(certificateIssued)
      expect(cdoTaskList.getUpdates().exemption).toEqual([])
      expect(cdoTaskList.getUpdates().dog).toEqual([])
      expect(sendActivityToAudit).toHaveBeenCalledWith({
        activity: 0,
        activityType: 'sent',
        pk: 'ED300097',
        source: 'dog',
        activityDate: expect.any(Date),
        targetPk: 'dog',
        activityLabel: 'Certificate sent to me@test.com'
      }, devUser)

      expect(sendCertificateByEmail).toHaveBeenCalledWith(cdoTaskList.person, cdoTaskList.dog, 'abc-123', 'me@test.com', false)
      expect(sendUpdateToAudit).not.toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          certificate_issued: expect.anything()
        },
        {
          index_number: 'ED300097',
          certificate_issued: expect.anything()
        },
        devUser)
      expect(sendUpdateToAudit).not.toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: expect.anything()
        },
        {
          index_number: 'ED300097',
          status: expect.anything()
        },
        devUser)
    })

    test('should issue certificate and create a new email', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        person: buildCdoPerson({
          personReference: 'P-8AD0-561A'
        }),
        exemption: buildExemption({
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: new Date(),
          microchipVerification: new Date(),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser, { sendOption: 'email', email: 'garrymcfadyen@hotmail.com', updateEmail: true, firstCertificate: true })

      expect(updatePersonEmail).toHaveBeenCalledWith('P-8AD0-561A', 'garrymcfadyen@hotmail.com', devUser)
      expect(cdoTaskList.person.contactDetails.email).toBe('garrymcfadyen@hotmail.com')
    })

    test('should issue certificate given only microchip and neutering deadlines set', async () => {
      const sentDate = new Date()
      const cdoIndexNumber = 'ED300097'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          exemptionOrder: '2015',
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: undefined,
          microchipVerification: undefined,
          neuteringDeadline: new Date('9999-10-01'),
          microchipDeadline: new Date('9999-10-01'),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          microchipNumber: '123456789012345',
          status: 'Pre-exempt',
          dateOfBirth: new Date()
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)
      mockCdoRepository.saveCdoTaskList.mockResolvedValue(cdoTaskList)

      const result = await cdoService.issueCertificate(cdoIndexNumber, sentDate, devUser, { sendOption: 'email', firstCertificate: true })

      expect(mockCdoRepository.getCdoTaskList).toHaveBeenCalledWith(cdoIndexNumber)
      expect(mockCdoRepository.saveCdoTaskList).toHaveBeenCalledWith(cdoTaskList)
      expect(result).toBe(sentDate)
      expect(cdoTaskList.getUpdates().exemption).toEqual([{
        key: 'certificateIssued',
        value: sentDate,
        callback: undefined
      }])

      await cdoTaskList.getUpdates().dog[0].callback()

      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'exemption',
        {
          index_number: 'ED300097',
          certificate_issued: undefined
        },
        {
          index_number: 'ED300097',
          certificate_issued: sentDate
        },
        devUser)
      expect(sendUpdateToAudit).toHaveBeenCalledWith(
        'dog',
        {
          index_number: 'ED300097',
          status: 'Pre-exempt'
        },
        {
          index_number: 'ED300097',
          status: 'Exempt'
        },
        devUser)
    })
  })

  describe('submitFormTwo', () => {
    test('should submit form 2', async () => {
      mockCdoRepository.submitFormTwo.mockImplementation(async (_indexNumber, _cdoTaskList, _payload, _username, sendEmailCallback) => {
        await sendEmailCallback()
      })
      const indexNumber = 'ED300100'
      const cdoTaskList = new CdoTaskList(buildCdo({
        exemption: buildExemption({
          exemptionOrder: '2015',
          applicationPackSent: new Date(),
          applicationPackProcessed: new Date(),
          form2Sent: new Date(),
          applicationFeePaid: new Date(),
          neuteringConfirmation: undefined,
          microchipVerification: undefined,
          neuteringDeadline: new Date('9999-10-01'),
          microchipDeadline: new Date('9999-10-01'),
          insuranceDetailsRecorded: new Date(),
          microchipNumberRecorded: new Date(),
          verificationDatesRecorded: new Date(),
          insurance: [buildCdoInsurance({
            renewalDate: new Date('9999-01-01'),
            company: 'Dogs Trust'
          })]
        }),
        dog: buildCdoDog({
          indexNumber,
          id: 300100,
          microchipNumber: '123456789012345',
          status: 'Pre-exempt',
          dateOfBirth: new Date(),
          name: 'Pip'
        })
      }))

      mockCdoRepository.getCdoTaskList.mockResolvedValue(cdoTaskList)

      const payload = {
        microchipNumber: '223456789012345',
        microchipVerification: '03/12/2024',
        neuteringConfirmation: '04/12/2024',
        microchipDeadline: '',
        dogNotNeutered: false,
        dogNotFitForMicrochip: false
      }
      const middleEarthUser = {
        username: 'bilbo.baggins@shire.police.me',
        displayname: 'Bilbo Baggins'
      }

      await cdoService.submitFormTwo(indexNumber, payload, middleEarthUser)

      expect(mockCdoRepository.submitFormTwo).toHaveBeenCalledWith('ED300100', cdoTaskList, payload, expect.objectContaining({ username: 'bilbo.baggins@shire.police.me' }), expect.any(Function))
      expect(sendForm2Emails).toHaveBeenCalledWith('ED300100', 'Pip', '223456789012345', false, '03/12/2024', '04/12/2024', false, 'bilbo.baggins@shire.police.me')
    })
  })
})
