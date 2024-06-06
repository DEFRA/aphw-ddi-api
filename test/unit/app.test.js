describe('Entry point test', () => {
  const mockExit = jest.spyOn(process, 'exit')
    .mockImplementation((number) => { throw new Error('process.exit: ' + number) })
  const mockStart = jest.fn()
  const mockServer = {
    start: mockStart.mockReturnThis()
  }

  jest.mock('../../app/messaging/create-message-sender')
  const { closeAllConnections } = require('../../app/messaging/create-message-sender')
  closeAllConnections.mockResolvedValue()

  jest.mock('../../app/server', () => jest.fn(() => {
    return {
      then (callback) {
        callback(mockServer)
        return this
      },
      catch (callback) {
        try {
          callback(new Error('Error forcing an exit'))
        } catch (e) {

        }
      }
    }
  }))

  test('entry point starts server', () => {
    require('../../app')
    expect(mockStart.mock.calls.length).toBe(1)
    expect(mockExit.mock.calls.length).toBe(1)
    expect(closeAllConnections.mock.calls.length).toBe(1)
  })
})
