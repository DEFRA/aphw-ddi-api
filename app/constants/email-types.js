const emailTypes = {
  verifyEmail: 'verify-email',
  generalError: 'general-error',
  feedback: 'user-feedback',
  userInvite: 'user-invite',
  reportSomething: 'report-something'
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

module.exports = {
  emailTypes,
  reportSomethingSubjectLines,
  reportSomethingAudit,
  reportTypes
}
