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

    expect(wreck.post).toHaveBeenCalledWith('http://localhost/documents/populate-template', { name: 'test1' })
  })
})
