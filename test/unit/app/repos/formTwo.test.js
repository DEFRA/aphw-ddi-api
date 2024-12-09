const { buildCdoTaskList, buildCdoDog } = require('../../../mocks/cdo/domain')
const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { buildRegistrationDao } = require('../../../mocks/cdo/get')
const { buildUserAccount } = require('../../../mocks/user-accounts')
const { NotFoundError } = require('../../../../app/errors/not-found')

describe('formTwo', () => {
  jest.mock('../../../../app/config/db', () => ({
    transaction: jest.fn(),
    col: jest.fn(),
    models: {
      form_two: {
        findOne: jest.fn(),
        create: jest.fn()
      },
      registration: {
        findOne: jest.fn()
      },
      user_account: {
        findOne: jest.fn()
      },
      police_force: {
        findOne: jest.fn()
      }
    },
    fn: jest.fn(),
    literal: jest.fn()
  }))

  const sequelize = require('../../../../app/config/db')
  const callback = jest.fn()

  jest.mock('../../../../app/lib/email-helper')
  const { createAuditsForFormTwo } = require('../../../../app/lib/email-helper')

  const { submitFormTwo } = require('../../../../app/repos/formTwo')

  const middleEarthUser = {
    username: 'bilbo.baggins@shire.police.me',
    displayname: 'Bilbo Baggins'
  }
  const cdoTaskList = buildCdoTaskList({
    dog: buildCdoDog({
      indexNumber: 'ED300100',
      microchipNumber: '223456789012345',
      name: 'Pip'
    })
  })

  const defaultPayload = {
    microchipVerification: '03/12/2024',
    neuteringConfirmation: '04/12/2024',
    microchipNumber: '543210987654321',
    microchipDeadline: '',
    dogNotNeutered: false,
    dogNotFitForMicrochip: false
  }
  describe('submitFormTwo', () => {
    beforeEach(() => {
      sequelize.models.registration.findOne.mockResolvedValue(buildRegistrationDao({
        id: 97
      }))
      sequelize.models.user_account.findOne.mockResolvedValue(buildUserAccount({
        id: 5,
        username: 'bilbo.baggins@shire.police.me',
        police_force: {
          id: 2,
          name: 'Shire Citizens Constabulary'
        }
      }))
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should start new transaction if none passed', async () => {
      sequelize.transaction.mockImplementation(callbackFn => callbackFn({}))

      await submitFormTwo('ED300100', cdoTaskList, defaultPayload, middleEarthUser, callback)

      expect(sequelize.transaction).toHaveBeenCalledTimes(1)
    })

    test('should submit a form two', async () => {
      /**
       * @type {FormTwoAuditDetails}
       */
      const expectedAudit = {
        indexNumber: 'ED300100',
        microchipVerification: '03/12/2024',
        neuteringConfirmation: '04/12/2024',
        microchipDeadline: '',
        microchipNumber: '543210987654321',
        dogNotNeutered: false,
        dogNotFitForMicrochip: false,
        policeForce: 'Shire Citizens Constabulary',
        username: 'bilbo.baggins@shire.police.me'
      }

      await submitFormTwo('ED300100', cdoTaskList, defaultPayload, middleEarthUser, callback, {})

      expect(callback).toHaveBeenCalled()
      expect(sequelize.models.form_two.findOne).toHaveBeenCalledWith({
        include: [{ as: 'registration', model: expect.anything() }],
        where: { '$registration.dog_id$': 300100 },
        transaction: {}
      })
      expect(sequelize.models.registration.findOne).toHaveBeenCalledWith({
        where: { dog_id: 300100 },
        transaction: {}
      })
      expect(sequelize.models.user_account.findOne).toHaveBeenCalledWith({
        include: [{ as: 'police_force', model: expect.anything() }],
        where: { username: 'bilbo.baggins@shire.police.me' },
        transaction: {}
      })
      expect(sequelize.models.form_two.create).toHaveBeenCalledWith({
        registration_id: 97,
        submitted_by: 'bilbo.baggins@shire.police.me',
        form_two_submitted: expect.any(Date)
      }, { transaction: {} })
      expect(createAuditsForFormTwo).toHaveBeenCalledWith(expectedAudit)
    })

    test('should throw if a form two already exists', async () => {
      sequelize.models.form_two.findOne.mockResolvedValue({
        id: 1
      })
      await expect(submitFormTwo('ED300100', cdoTaskList, defaultPayload, middleEarthUser, callback, {})).rejects.toThrow(new DuplicateResourceError('Form Two already submitted'))
    })
    test('should throw if registration is not found', async () => {
      sequelize.models.registration.findOne.mockResolvedValue(null)
      await expect(submitFormTwo('ED300100', cdoTaskList, defaultPayload, middleEarthUser, callback, {})).rejects.toThrow(new NotFoundError('Cdo not found'))
    })
    test('should throw if registration is not found', async () => {
      sequelize.models.user_account.findOne.mockResolvedValue(null)
      await expect(submitFormTwo('ED300100', cdoTaskList, defaultPayload, middleEarthUser, callback, {})).rejects.toThrow(new NotFoundError('User account not found'))
    })
  })
})
