const overnightJobUser = {
  username: 'overnight-job-system-user',
  displayname: 'Overnight Job System User'
}

const issuers = {
  api: 'aphw-ddi-api',
  enforcement: 'aphw-ddi-enforcement',
  portal: 'aphw-ddi-portal'
}

const scopes = {
  admin: 'Dog.Index.Admin',
  standard: 'Dog.Index.Standard',
  enforcement: 'Dog.Index.Enforcement',
  internal: ['Dog.Index.Admin', 'Dog.Index.Standard'],
  all: ['Dog.Index.Admin', 'Dog.Index.Standard', 'Dog.Index.Enforcement']
}

module.exports = {
  overnightJobUser,
  issuers,
  scopes
}
