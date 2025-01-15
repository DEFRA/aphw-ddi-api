describe('Documents proxy', () => {
  jest.mock('@hapi/wreck')
  const wreck = require('@hapi/wreck')

  const { populateTemplate } = require('../../../../app/proxy/documents')

  beforeEach(async () => {
    jest.clearAllMocks()
    wreck.post.mockResolvedValue()
  })

  test('populateTemplate should post to correct URL', async () => {
    await populateTemplate({ name: 'test1' })

    expect(wreck.post.mock.calls[0][0]).toContain('/populate-template')
    expect(wreck.post.mock.calls[0][1]).toEqual({ name: 'test1' })
  })
})
