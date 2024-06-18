const robotImportUser = { username: 'robot-import-system-user', displayname: 'Robot Import' }

const overnightJobUser = {
  username: 'overnight-job-system-user',
  displayname: 'Overnight Job System User'
}

const stages = {
  spreadsheetValidation: 'spreadsheet-validation',
  importValidation: 'import-validation',
  saveToDb: 'save-to-db'
}

module.exports = {
  robotImportUser,
  overnightJobUser,
  stages
}
