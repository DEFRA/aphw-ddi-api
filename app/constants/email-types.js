const emailTypes = {
  verifyEmail: 'verify-email',
  generalError: 'general-error',
  feedback: 'user-feedback',
  userInvite: 'user-invite',
  reportSomething: 'report-something',
  form2SubmissionToDefra: 'form2-submission-to-defra',
  form2ConfirmationToPolice: 'form2-confirmation-to-police',
  emailApplicationPack: 'email-application-pack',
  postApplicationPack: 'post-application-pack'
}

const reportSomethingSubjectLines = {
  Defra: 'Police correspondence received',
  Police: 'We\'ve received your report'
}

/**
 * @typedef ReportType
 * @type {'in-breach'|'changed-address'|'dog-died'|'something-else'}
 */

/**
 * @typedef ReportTypeEnum
 * @property {ReportType} inBreach
 * @property {ReportType} changedAddress
 * @property {ReportType} dogDied
 * @property {ReportType} somethingElse
 */
/**
 * @type {ReportTypeEnum}
 */
const reportTypes = {
  inBreach: 'in-breach',
  changedAddress: 'changed-address',
  dogDied: 'dog-died',
  somethingElse: 'something-else'
}

const reportSomethingAudit = {
  id: '4',
  label: 'Police correspondence',
  activityType: 'received'
}

const formTwoSubmissionAudit = {
  id: '4',
  label: 'Form 2',
  activityType: 'received'
}

module.exports = {
  emailTypes,
  reportSomethingSubjectLines,
  reportSomethingAudit,
  reportTypes,
  formTwoSubmissionAudit
}
