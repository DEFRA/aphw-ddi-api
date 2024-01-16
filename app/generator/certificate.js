const PDFDocument = require('pdfkit')

const { findFont } = require('./fonts')
const { formatDate } = require('../lib/date-helpers')

const processTemplate = (doc, template, values) => {
  for (const item of template.definition) {
    const { type, name, key, text, items, font: fontId, size, x, y, lineBreak, options } = item

    switch (type) {
      case 'text': {
        const value = values[key] ? values[key] : text

        doc.font(findFont(fontId))
          .fontSize(size)

        if (x && y) {
          doc.text(value, x, y, options)
        } else {
          doc.text(value, options)
        }

        break
      }
      case 'image': {
        doc.image(template[name], x, y, options)
        break
      }
      case 'list': {
        doc.font(findFont(fontId))
          .fontSize(size)
          .list(items, options)
        break
      }
      case 'page': {
        doc.addPage(options)
        break
      }
    }

    if (lineBreak) {
      doc.moveDown(lineBreak)
    }
  }
}

const getCertificateValues = (data) => ({
  ownerName: `${data.person.firstName} ${data.person.lastName}`,
  addressLine1: data.person.addresses[0].address.address_line_1,
  addressLine2: data.person.addresses[0].address.address_line_2,
  addressLine3: data.person.addresses[0].address.address_line_3,
  addressPostcode: data.person.addresses[0].address.postcode,
  dogIndexNumber: data.dog.indexNumber,
  dogMicrochipNumber: data.dog.microchipNumber,
  dogName: data.dog.name,
  dogBreed: data.dog.breed,
  dogSex: data.dog.sex,
  dogBirthDate: data.dog.dateOfBirth ? formatDate(data.dog.dateOfBirth) : null,
  dogColour: data.dog.colour,
  certificateIssueDate: formatDate(new Date())
})

const generateCertificate = (template, data) => {
  return new Promise((resolve) => {   
    const values = getCertificateValues(data)

    const doc = new PDFDocument({ autoFirstPage: false })

    processTemplate(doc, template, values)

    doc.end()

    const chunks = []

    doc.on('data', (chunk) => {
      chunks.push(chunk)
    })

    doc.on('end', () => {
      const buffer = Buffer.concat(chunks)

      resolve(buffer)
    })
  })
}

module.exports = {
  generateCertificate
}
