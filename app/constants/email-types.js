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

const reportSomethingAudit = {
  id: '4',
  label: 'Police correspondence',
  activityType: 'received'
}

module.exports = {
  emailTypes,
  reportSomethingSubjectLines,
  reportSomethingAudit
}
