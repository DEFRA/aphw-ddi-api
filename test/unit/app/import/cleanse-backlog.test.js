const { cleanseRow, extractPersonDateOfBirth } = require('../../../../app/import/cleanse-backlog.js')
const { dbLogWarningToBacklog } = require('../../../../app/lib/db-functions')
jest.mock('../../../../app/lib/db-functions')

describe('CleanseBacklog test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('cleanseRow should change breed type if appropriate', async () => {
    const row = { dataValues: { json: { breed: 'Pit Bull Terrier Type' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.breed).toBe('Pit Bull Terrier')
  })

  test('cleanseRow should change incorrect Cheshire police force if appropriate', async () => {
    const row = { dataValues: { json: { policeForce: 'Cheshire Police' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.policeForce).toBe('Cheshire Constabulary')
  })

  test('cleanseRow should change incorrect Cumbria police force if appropriate', async () => {
    const row = { dataValues: { json: { policeForce: 'Cumbria Police' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.policeForce).toBe('Cumbria Constabulary')
  })

  test('cleanseRow should change incorrect Devon and Cornwall police force if appropriate', async () => {
    const row = { dataValues: { json: { policeForce: 'Devon and Cornwall Constabulary' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.policeForce).toBe('Devon and Cornwall Police')
  })

  test('cleanseRow should change incorrect Leicestershire police force if appropriate', async () => {
    const row = { dataValues: { json: { policeForce: 'Leicestershire Constabulary' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.policeForce).toBe('Leicestershire Police')
  })

  test('cleanseRow should change incorrect Dumfries and Galloway police force if appropriate', async () => {
    const row = { dataValues: { json: { policeForce: 'Dumfries & Galloway Police' } } }
    const cleansed = await cleanseRow(row)
    expect(cleansed.policeForce).toBe('Dumfries and Galloway Constabulary')
  })

  test('extractDateOfBith should extract DOB from comments field', async () => {
    dbLogWarningToBacklog.mockResolvedValue()
    const row = { comments: 'Born: 01 March 2003' }
    const dob = await extractPersonDateOfBirth(row, { })
    expect(dob.toISOString()).toBe(new Date(2003, 2, 1).toISOString())
    expect(dbLogWarningToBacklog).toHaveBeenCalledTimes(0)
  })

  test('extractDateOfBith should extract DOB from comments field when ends with carriage return', async () => {
    dbLogWarningToBacklog.mockResolvedValue()
    const row = { comments: 'some text here Born: 4 May 2005 \n some other text' }
    const dob = await extractPersonDateOfBirth(row, { })
    expect(dob.toISOString()).toBe(new Date(2005, 4, 4).toISOString())
    expect(dbLogWarningToBacklog).toHaveBeenCalledTimes(0)
  })

  test('extractDateOfBith should log warning when invalid date', async () => {
    dbLogWarningToBacklog.mockResolvedValue()
    const row = { comments: 'some text Born: 34 May 2005 \n some other text' }
    const dob = await extractPersonDateOfBirth(row, { })
    expect(dob).toBe(undefined)
    expect(dbLogWarningToBacklog).toHaveBeenCalledTimes(1)
  })

  test('extractDateOfBith should log warning when blank date', async () => {
    dbLogWarningToBacklog.mockResolvedValue()
    const row = { comments: 'some text Born: \n some other text' }
    const dob = await extractPersonDateOfBirth(row, { })
    expect(dob).toBe(undefined)
    expect(dbLogWarningToBacklog).toHaveBeenCalledTimes(1)
  })
})
