describe('update', () => {
  describe('validatePayload', () => {
    jest.mock('../../../../../app/repos/cdo')
    const { getCdo } = require('../../../../../app/repos/cdo')
    const { validatePayload } = require('../../../../../app/schema/exemption/update')

    test('should handle 1991 dogs', async () => {
      getCdo.mockResolvedValue({
        registration: {
          exemption_order: {
            exemption_order: '1991'
          }
        }
      })
      const validated = await validatePayload({
        indexNumber: 'ED300000',
        exemptionOrder: '1991',
        policeForce: 'Police force'
      })
      expect(validated.errors).toBeUndefined()
    })
  })
})
