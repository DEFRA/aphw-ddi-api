const config = require('../config/index')
const { emailTypes, reportSomethingSubjectLines, reportSomethingAudit, reportTypes, formTwoSubmissionAudit } = require('../constants/email-types')
const { lookupPoliceForceByEmail } = require('../repos/police-forces')
const { formatToGds } = require('../lib/date-helpers')
const { preparePostalNameAndAddress } = require('../lib/address-helper')
const { sendEmail } = require('../messaging/send-email')
const { sendActivityToAudit } = require('../messaging/send-audit')
const { v4: uuidv4 } = require('uuid')
const { populateTemplate } = require('../proxy/documents')
const { getLiveTemplate } = require('../storage/utilities')

const sendReportSomethingEmails = async (payload) => {
  const userField = payload?.fields.find(x => x.name === 'ReportedBy')
  const policeForce = await lookupPoliceForceByEmail(userField?.value)

  const customFields = [{ name: 'PoliceForce', value: policeForce }]
    .concat(payload?.fields.map(field => ({
      name: field.name,
      value: field.value
    })))

  const customFieldsDefra = [{ name: 'Subject', value: reportSomethingSubjectLines.Defra }]
    .concat(customFields)

  const dataDefra = {
    toAddress: config.reportSomethingEmailAddress,
    type: emailTypes.reportSomething,
    customFields: customFieldsDefra
  }

  await sendEmail(dataDefra)

  const customFieldsPolice = [{ name: 'Subject', value: reportSomethingSubjectLines.Police }]
    .concat(customFields)

  const dataPolice = {
    toAddress: userField?.value,
    type: emailTypes.reportSomething,
    customFields: customFieldsPolice
  }

  await sendEmail(dataPolice)

  return {
    reportData: payload?.reportData,
    policeForce,
    username: userField?.value
  }
}

const createAuditPayload = (data, pk, source, targetPk, activityId, reportType) => {
  return {
    activityId,
    activity: reportSomethingAudit.id,
    activityType: reportSomethingAudit.activityType,
    pk,
    source,
    activityDate: new Date(),
    targetPk,
    reportType,
    activityLabel: `${reportSomethingAudit.label} from ${data?.policeForce}`
  }
}
/**
 * @typedef ReportData
 * @property {string} sourceType - e.g. 'dog',
 * @property {string} personReference - e.g. 'P-BBDC-8579',
 * @property {string} pk - e.g. 'ED300002',
 * @property {string[]} dogs - e.g. [ 'ED300002' ],
 * @property {ReportType} reportType - e.g. 'in-breach',
 * @property {string} subTitle - e.g. 'Dog ED300002',
 * @property {{ indexNumber: string }} dogChosen - e.g. { indexNumber: 'ED300002' },
 * @property {string[]} dogBreaches - e.g. [ 'Dog not kept on lead or muzzled in public place' ]
 */
/**
 * @typedef ReportDataData
 * @property {ReportData} reportData
 * @property {string} policeForce
 * @property {string} username
 */
/**
 * @param {ReportDataData} data
 * @return {Promise<void>}
 */
const createAuditsForReportSomething = async (data) => {
  if (!data?.reportData) {
    return
  }

  const reportToOwner = [reportTypes.changedAddress, reportTypes.somethingElse].includes(data.reportData.reportType)
  const reportId = uuidv4()
  const reportType = data.reportData.reportType
  let dogs = data.reportData.dogs ?? []

  if (data.reportData.dogChosen) {
    dogs = [data.reportData.dogChosen.indexNumber]
  }

  for (const dogIndex of dogs) {
    const payload = createAuditPayload(data, dogIndex, 'dog', 'dog', reportId, reportType)
    await sendActivityToAudit(payload, { username: data.username, displayname: data.username })
  }

  if (reportToOwner) {
    const payload = createAuditPayload(data, data.reportData.personReference, 'owner', 'owner', reportId, reportType)
    await sendActivityToAudit(payload, { username: data.username, displayname: data.username })
  }
}
/**
 * @typedef FormTwoAuditDetails
 * @property {string} username
 * @property {string} indexNumber
 * @property {string} microchipNumber
 * @property {string} microchipVerification
 * @property {string} neuteringConfirmation
 * @property {string} microchipDeadline
 * @property {boolean} dogNotNeutered
 * @property {boolean} dogNotFitForMicrochip
 * @property {string} policeForce
 *
 */
/**
 * @param {FormTwoAuditDetails} details
 * @param {string} pk
 * @param {string} source
 * @param {string} targetPk
 * @param {string} activityId
 * @returns {{activityId, activityDate: Date, activity: string, targetPk: string, details, pk, source, activityType: string, activityLabel: string}}
 */
const createSubmitFormTwoAuditPayload = (details, pk, source, targetPk, activityId) => {
  return {
    activityId,
    activity: formTwoSubmissionAudit.id,
    activityType: formTwoSubmissionAudit.activityType,
    pk,
    source,
    activityDate: new Date(),
    targetPk,
    details,
    activityLabel: `${formTwoSubmissionAudit.label} from ${details.policeForce}`
  }
}

/**
 * @param {FormTwoAuditDetails} details
 * @returns {Promise<void>}
 */
const createAuditsForSubmitFormTwo = async (details) => {
  const payload = createSubmitFormTwoAuditPayload(details, details.indexNumber, 'dog', 'dog', uuidv4())
  await sendActivityToAudit(payload, { username: details.username, displayname: details.username })
}

const sendForm2Emails = async (indexNumber, dogName, microchipNumber, unfit, microchipDate, neuteringDate, under16, username) => {
  const baseFields = [
    { name: 'index_number', value: indexNumber },
    { name: 'dog_name', value: dogName && dogName !== '' ? dogName : 'Not received' },
    { name: 'microchip_number', value: microchipNumber && microchipNumber !== '' ? microchipNumber : 'Not received' },
    { name: 'unfit_to_microchip', value: unfit ? 'yes' : 'no' },
    { name: 'microchip_date', value: microchipDate },
    { name: 'neutering_date', value: under16 ? '' : neuteringDate },
    { name: 'under_16_months', value: under16 ? 'yes' : 'no' }
  ]
  const policeForce = await lookupPoliceForceByEmail(username)

  const baseCustomFields = []
    .concat(baseFields.map(field => ({
      name: field.name,
      value: field.value
    })))

  const defraCustomFields = [
    { name: 'police_force', value: policeForce },
    { name: 'submitted_by', value: username }]
    .concat(baseCustomFields)

  const dataDefra = {
    toAddress: config.reportSomethingEmailAddress,
    type: emailTypes.form2SubmissionToDefra,
    customFields: defraCustomFields
  }

  await sendEmail(dataDefra)

  const policeCustomFields = []
    .concat(baseCustomFields)

  const dataPolice = {
    toAddress: username,
    type: emailTypes.form2ConfirmationToPolice,
    customFields: policeCustomFields
  }

  await sendEmail(dataPolice)
}

/**
 * @param {Person} person
 * @param {Dog} dog
 * @param [_user]
 * @return {Promise<{emailAddress: *}>}
 */
const emailApplicationPack = async (person, dog, _user) => {
  const { name, indexNumber } = dog
  const { firstName, lastName } = person
  const { email } = person.contactDetails

  const dogName = name && name !== '' ? name : 'Your dog'

  const templateData = {
    fileInfo: {
      filename: await getLiveTemplate(emailTypes.emailApplicationPack),
      fileGuid: uuidv4(),
      saveFile: true
    },
    fieldData: {
      ddi_index_number: indexNumber
    }
  }

  await populateTemplate({ payload: templateData })

  const customFields = [
    { name: 'dog_name', value: dogName },
    { name: 'dog_name_with_apostrophy', value: `${dogName}'s` },
    { name: 'owner_name', value: `${firstName} ${lastName}` },
    { name: 'index_number', value: indexNumber },
    { name: 'file_key_to_attach', value: 'link_to_file' },
    { name: 'filename_for_display', value: `Defra application pack for ${dogName} ${indexNumber}.pdf` },
    { name: 'link_to_file', value: `temp-populations/${templateData.fileInfo.fileGuid}.pdf` }
  ]

  const emailData = {
    toAddress: email,
    type: emailTypes.emailApplicationPack,
    customFields
  }

  await sendEmail(emailData)

  return {
    emailAddress: email
  }
}

const postApplicationPack = async (person, dog, _user) => {
  const { name, indexNumber } = dog
  const { firstName, lastName, contactDetails } = person

  const dogName = name && name !== '' ? name : 'Your dog'

  const postaNameAndAddress = preparePostalNameAndAddress(person)

  const templateData = {
    fileInfo: {
      filename: await getLiveTemplate(emailTypes.postApplicationPack),
      fileGuid: uuidv4(),
      flattenPdf: true,
      saveFile: true
    },
    fieldData: {
      ddi_index_number: indexNumber,
      ddi_dog_name: dogName,
      ddi_owner_name: `${firstName} ${lastName}`,
      ddi_address_line_1: contactDetails.addressLine1,
      ddi_address_line_2: contactDetails.addressLine2,
      ddi_town: contactDetails.town,
      ddi_postcode: contactDetails.postcode,
      ddi_postal_name_and_address: postaNameAndAddress,
      ddi_todays_date: formatToGds(new Date())
    }
  }

  await populateTemplate({ payload: templateData })

  const customFields = [
    { name: 'index_number', value: indexNumber },
    { name: 'file_key_to_attach', value: 'link_to_file' },
    { name: 'filename_for_display', value: `Defra application pack for ${dogName} ${indexNumber}.pdf` },
    { name: 'link_to_file', value: `temp-populations/${templateData.fileInfo.fileGuid}.pdf` }
  ]

  const letterData = {
    toAddress: 'not-applicable-as-posting-letter',
    type: emailTypes.postApplicationPack,
    customFields
  }

  await sendEmail(letterData)
}

module.exports = {
  sendReportSomethingEmails,
  sendForm2Emails,
  createAuditsForReportSomething,
  createAuditsForSubmitFormTwo,
  emailApplicationPack,
  postApplicationPack
}
