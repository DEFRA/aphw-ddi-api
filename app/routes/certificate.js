const { generateCertificate } = require('../generator/certificate')
const { getCertificateTemplate } = require('../storage/repos/certificate-template')
const { getCdo } = require('../repos/cdo')
const { cdoViewDto } = require('../dto/cdo')
const { uploadCertificate } = require('../storage/repos/certificate')
const { v4: uuidv4 } = require('uuid')

module.exports = {
  method: 'GET',
  path: '/certificate/{indexNumber}',
  handler: async (request, h) => {
    try {
      const cdo = cdoViewDto(await getCdo(request.params.indexNumber))

      const template = await getCertificateTemplate(cdo.exemption.exemptionOrder)
      const cert = await generateCertificate(template, cdo)

      const certificateId = uuidv4()

      await uploadCertificate(cdo.dog.indexNumber, certificateId, cert)

      return h.response({ certificateId }).code(201)
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
