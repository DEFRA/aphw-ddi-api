describe('certificate template repo', () => {
  const storageConfig = require('../../../../../app/config/storage')
  const { blobServiceClient } = require('../../../../../app/storage/get-blob-client')

  const seedTemplate = async () => {
    const container = blobServiceClient.getContainerClient(storageConfig.certificateTemplateContainer)

    await container.createIfNotExists()

    const templateClient = container.getBlockBlobClient('2015.template.json')
    const template = Buffer.from('{ "hello": "world" }')
    await templateClient.upload(template, template.length)
  }

  const seedStaticFiles = async () => {
    const container = blobServiceClient.getContainerClient(storageConfig.certificateTemplateContainer)

    await container.createIfNotExists()

    const logoClient = container.getBlockBlobClient('logo.png')
    const logo = Buffer.from('hello world')
    await logoClient.upload(logo, logo.length)

    const signatureClient = container.getBlockBlobClient('signature.png')
    const signature = Buffer.from('hello world')
    await signatureClient.upload(signature, signature.length)
  }

  afterEach(async () => {
    await blobServiceClient.deleteContainer(storageConfig.certificateTemplateContainer)

    jest.clearAllMocks()
    jest.resetModules()
  })

  test('should get certificate template', async () => {
    const { getCertificateTemplate } = require('../../../../../app/storage/repos/certificate-template')

    await seedTemplate()
    await seedStaticFiles()

    const { definition, logo, signature } = await getCertificateTemplate(2015)

    expect(definition).toEqual({ hello: 'world' })
    expect(logo).toEqual(Buffer.from('hello world'))
    expect(signature).toEqual(Buffer.from('hello world'))
  })

  test('should not get certificate template if already cached', async () => {
    const { getCertificateTemplate } = require('../../../../../app/storage/repos/certificate-template')

    await seedTemplate()
    await seedStaticFiles()

    const containerSpy = jest.spyOn(blobServiceClient, 'getContainerClient')

    await getCertificateTemplate(2015)

    expect(containerSpy).not.toHaveBeenCalled()
  })

  test('should throw error if exemption template does not exist', async () => {
    const { getCertificateTemplate } = require('../../../../../app/storage/repos/certificate-template')

    await expect(getCertificateTemplate(2027)).rejects.toThrow('Template (2027.template.json) does not exist')
  })

  test('should throw error if static file does not exist', async () => {
    const { getCertificateTemplate } = require('../../../../../app/storage/repos/certificate-template')

    await seedTemplate()

    await expect(getCertificateTemplate(2015)).rejects.toThrow('File (logo.png) does not exist')
  })
})
