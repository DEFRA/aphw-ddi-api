const { getHttpCodeFromResults } = require('../../../../../app/dto/mappers/bulk-requests')
describe('bulk-requests', () => {
  describe('getHttpCodeFromResults', () => {
    test('should return 200 if no errors', () => {
      /**
       * @type {BulkRequestResponse}
       */
      const response = {
        items: [1]
      }
      expect(getHttpCodeFromResults(response)).toBe(200)
    })

    test('should return 400 if mixture of errors and items', () => {
      /**
       * @type {BulkRequestResponse}
       */
      const response = {
        items: [1],
        errors: [
          {
            data: 1,
            statusCode: 409,
            message: 'conflict'
          }
        ]
      }
      expect(getHttpCodeFromResults(response)).toBe(400)
    })

    test('should return 400 if mixture of errors', () => {
      /**
       * @type {BulkRequestResponse}
       */
      const response = {
        items: [],
        errors: [
          {
            data: 1,
            statusCode: 409,
            message: 'conflict'
          },
          {
            data: 2,
            statusCode: 500,
            message: 'error'
          }
        ]
      }
      expect(getHttpCodeFromResults(response)).toBe(400)
    })

    test('should return 409 if all errors 409', () => {
      /**
       * @type {BulkRequestResponse}
       */
      const response = {
        items: [],
        errors: [
          {
            data: 1,
            statusCode: 409,
            message: 'conflict'
          },
          {
            data: 2,
            statusCode: 409,
            message: 'conflict'
          }
        ]
      }
      expect(getHttpCodeFromResults(response)).toBe(409)
    })

    test('should return 500 if all errors 500', () => {
      /**
       * @type {BulkRequestResponse}
       */
      const response = {
        items: [],
        errors: [
          {
            data: 1,
            statusCode: 500,
            message: 'conflict'
          },
          {
            data: 2,
            statusCode: 500,
            message: 'error'
          }
        ]
      }
      expect(getHttpCodeFromResults(response)).toBe(500)
    })
  })
})
