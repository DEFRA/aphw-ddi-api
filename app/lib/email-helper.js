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
    activityLabel: `${reportSomethingAudit.label} ${reportSomethingAudit.activityType} from ${data?.policeForce}`
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
  createAuditsForReportSomething
}
