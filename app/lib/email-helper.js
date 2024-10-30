const config = require('../config/index')
const { emailTypes, reportSomethingSubjectLines, reportSomethingAudit } = require('../constants/email-types')
const { lookupPoliceForceByEmail } = require('../repos/police-forces')
const { sendEmail } = require('../messaging/send-email')
const { sendActivityToAudit } = require('../messaging/send-audit')

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

const createAuditPayload = (data, pk, source, targetPk) => {
  return {
    activity: reportSomethingAudit.id,
    activityType: reportSomethingAudit.activityType,
    pk,
    source,
    activityDate: new Date(),
    targetPk,
    activityLabel: `${reportSomethingAudit.label} ${reportSomethingAudit.activityType} from ${data?.policeForce}`
  }
}

const createAuditsForReportSomething = async (data) => {
  if (!data?.reportData) {
    return
  }

  for (const dogIndex of data.reportData?.dogs ?? []) {
    const payload = createAuditPayload(data, dogIndex, 'dog', 'dog')
    await sendActivityToAudit(payload, { username: data?.username, displayname: data?.username })
  }

  if (data.reportData.sourceType === 'owner') {
    const payload = createAuditPayload(data, data.reportData.pk, 'owner', 'owner')
    await sendActivityToAudit(payload, { username: data?.username, displayname: data?.username })
  }
}

module.exports = {
  sendReportSomethingEmails,
  createAuditsForReportSomething
}
