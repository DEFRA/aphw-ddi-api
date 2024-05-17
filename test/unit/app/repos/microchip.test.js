const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
describe('microchip', () => {
  jest.mock('../../../../app/config/db', () => ({
    models: {
      microchip: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn()
      },
      dog_microchip: {
        create: jest.fn()
      }
    },
    where: jest.fn(),
    transaction: jest.fn(),
    col: jest.fn().mockReturnValue(''),
    fn: jest.fn().mockReturnValue('')
  }))
  const sequelize = require('../../../../app/config/db')
  const { Op } = require('sequelize')

  const { microchipExists, updateMicrochips, updateMicrochip } = require('../../../../app/repos/microchip')

  describe('updateMicrochip', () => {
    test('should create new microchip given none exists', async () => {
      sequelize.models.microchip.findAll.mockResolvedValue(null)
      sequelize.models.microchip.create.mockResolvedValue({ id: '277890823930477' })

      await updateMicrochip({ id: 1 }, '277890823930477', 1, {})
      expect(sequelize.models.dog_microchip.create).toHaveBeenCalled()
    })

    test('should update microchip given one exists', async () => {
      sequelize.models.microchip.findAll.mockResolvedValue([
        {
          id: 1,
          microchip_number: '277890823930477',
          dog_microchips: [{
            id: 15,
            dog_id: 300549,
            microchip_id: 15
          }]
        }
      ])
    })
  })

  describe('updateMicrochips', () => {
    test('should throw DuplicateResourceError is one microchip is a duplicates ', async () => {
      sequelize.models.microchip.findOne.mockResolvedValueOnce({
        id: 1,
        microchip_number: '277890823930477',
        dog_microchips: [{
          id: 15,
          dog_id: 300549,
          microchip_id: 15
        }]
      })
      sequelize.models.microchip.findOne.mockResolvedValueOnce(null)
      const payload = {
        microchipNumber: '277890823930477',
        microchipNumber2: '759628280825931'
      }
      await expect(updateMicrochips(300550, payload, {})).rejects.toThrow(new DuplicateResourceError('The microchip number already exists', { microchipNumbers: ['277890823930477'] }))
    })

    test('should throw DuplicateResourceError is one microchip is a duplicates ', async () => {
      sequelize.models.microchip.findOne.mockResolvedValueOnce({
        id: 1,
        microchip_number: '277890823930477',
        dog_microchips: [{
          id: 15,
          dog_id: 300549,
          microchip_id: 15
        }]
      })
      sequelize.models.microchip.findOne.mockResolvedValueOnce({
        id: 1,
        microchip_number: '759628280825931',
        dog_microchips: [{
          id: 14,
          dog_id: 300548,
          microchip_id: 14
        }]
      })
      const payload = {
        microchipNumber: '277890823930477',
        microchipNumber2: '759628280825931'
      }
      await expect(updateMicrochips(300550, payload, {})).rejects.toThrow(new DuplicateResourceError('The microchip number already exists', { microchipNumbers: ['277890823930477', '759628280825931'] }))
    })
  })

  describe('microchipExists', () => {
    test('should get microchip', async () => {
      sequelize.models.microchip.findOne.mockResolvedValue({
        id: 1,
        microchip_number: '277890823930477',
        dog_microchips: [{
          id: 15,
          dog_id: 300549,
          microchip_id: 15
        }]
      })
      const microchip = await microchipExists(5, '277890823930477', {})
      expect(microchip).toEqual('277890823930477')
      expect(sequelize.models.microchip.findOne).toHaveBeenCalledWith({
        where: {
          microchip_number: '277890823930477'
        },
        include: [{
          model: sequelize.models.dog_microchip,
          as: 'dog_microchips',
          where: {
            dog_id: {
              [Op.not]: 5
            }
          }
        }],
        transaction: {}
      })
    })

    test('should return null given microchip does not exist', async () => {
      sequelize.models.microchip.findOne.mockResolvedValue(null)
      const microchip = await microchipExists(2, '277890823930477', {})
      expect(microchip).toEqual(null)
    })
  })
})
