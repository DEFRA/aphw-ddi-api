const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const { generateCertificate } = require('../generator/certificate')
const { getCertificateTemplate } = require('../storage/repos/certificate-template')
const { getCdo } = require('../repos/cdo')
const { cdoViewDto } = require('../dto/cdo')
const { uploadCertificate } = require('../storage/repos/certificate')

module.exports = {
  method: 'POST',
  path: '/certificate',
  options: {
    validate: {
      payload: Joi.object({
        indexNumber: Joi.string().required()
      }),
      failAction: async (request, h, error) => {
        return h.response().code(400).takeover()
      }
    }
  },
  handler: async (request, h) => {
    try {
      const cdo = cdoViewDto(await getCdo(request.payload.indexNumber))

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
