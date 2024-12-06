const config = require('../config/index')
const { emailTypes, reportSomethingSubjectLines, reportSomethingAudit, reportTypes } = require('../constants/email-types')
const { lookupPoliceForceByEmail } = require('../repos/police-forces')
const { sendEmail } = require('../messaging/send-email')
const { sendActivityToAudit } = require('../messaging/send-audit')
const { v4: uuidv4 } = require('uuid')

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

const sendForm2EmailsFromTaskList = async (indexNumber, cdoTaskList, user) => {
  return sendForm2Emails(
    indexNumber,
    cdoTaskList.dog.name,
    cdoTaskList.dog.microchipNumber, // may need to be overridden from payload
    false, // unfit - boolean (from payload?)
    '02/12/2024', // microchip_date (from payload?) - as string object not date
    '01/12/2024', // neutering date (from payload?) - as string object not date (or empty string),
    false, // under16 (from payload)
    'jeremy.barnsley@defra.gov.uk' // user.username
  )
}

const sendForm2Emails = async (indexNumber, dogName, microchipNumber, unfit, microchipDate, neuteringDate, under16, username) => {
  const baseFields = [
    { name: 'index_number', value: indexNumber },
    { name: 'dog_name', value: dogName },
    { name: 'microchip_number', value: microchipNumber },
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

  const dataPolice = {
    toAddress: username,
    type: emailTypes.form2ConfirmationToPolice,
    customFields: baseCustomFields
  }

  await sendEmail(dataPolice)
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

module.exports = {
  sendReportSomethingEmails,
  sendForm2Emails,
  sendForm2EmailsFromTaskList,
  createAuditsForReportSomething
}
