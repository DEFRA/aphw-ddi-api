jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')
const importData = require('./mock-xlsx-import')
const { parseBlob } = require('../../../../../app/import/access/access-db')
const { uploadInboundFile } = require('../../../../../app/storage')

describe('AccessDB test', () => {
  test('should return import rows from xlsx', async () => {
    mockReadXlsxFile.mockReturnValue(importData)
    const Readable = require('stream').Readable
    const str = new Readable()
    str.push('some dummy file content that is ignored as we are mocking the readXlsxFile method')
    str.push(null)
    await uploadInboundFile(str, 'myfile.xlsx')
    const payload = await parseBlob('myfile.xlsx')
    expect(mockReadXlsxFile).toHaveBeenCalledTimes(1)
    expect(payload.rows).toHaveLength(2)
  })
})
