describe('certificate generator', () => {
  const { generateCertificate } = require('../../../../app/generator/certificate')
  const template = require('../../../mocks/template')

  test('should generate pdf', async () => {
    const cert = await generateCertificate(template, {
      person: {
        firstName: 'Joe',
        lastName: 'Bloggs',
        addresses: [
          {
            address: {
              address_line_1: '12 Test Street',
              address_line_2: '',
              address_line_3: 'Test City',
              postcode: 'TST 1AA'
            }
          }
        ]
      },
      dog: {
        indexNumber: 'ED1234',
        microchipNumber: '1234',
        name: 'Fido',
        breed: 'XL Bully',
        sex: 'Male',
        dateOfBirth: new Date(),
        colour: 'white'
      }
    })

    expect(cert).toEqual(expect.any(Buffer))
  })
})
