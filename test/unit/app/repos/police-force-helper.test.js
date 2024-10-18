const { devUser } = require('../../../mocks/auth')

describe('Police force helper', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      registration: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
      },
      registered_person: {
        findAll: jest.fn()
      }
    }
  }))

  const sequelize = require('../../../../app/config/db')

  jest.mock('../../../../app/messaging/send-audit')
  const { sendUpdateToAudit } = require('../../../../app/messaging/send-audit')

  //   const { hasForceChanged, setPoliceForceOnCdos } = require('../../../../app/repos/police-force-helper')
  const { setPoliceForceOnCdos } = require('../../../../app/repos/police-force-helper')

  beforeEach(async () => {
    jest.clearAllMocks()
    sendUpdateToAudit.mockResolvedValue()
  })

  describe('setPoliceForceOnCdos', () => {
    test('should handle one dog when new force is different to existing', async () => {
      const currentPoliceForce = {
        id: 20,
        name: 'Old force'
      }
      sequelize.models.registration.findOne.mockResolvedValue({ id: 1000, police_force: { id: 123, name: 'Test force' } })

      const res = await setPoliceForceOnCdos(currentPoliceForce, ['ED456'], devUser, {})

      expect(res).toBeTruthy()
      expect(sequelize.models.registration.update).toHaveBeenCalledWith({ police_force_id: 20 }, { transaction: {}, where: { id: 1000 } })
    })
  })
})
