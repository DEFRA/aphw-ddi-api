const accessImportUser = { username: 'import-access-db', displayname: 'Import Access DB' }
const robotImportUser = { username: 'robot-import-system-user', displayname: 'Robot Import' }

const stages = {
  spreadsheetValidation: 'spreadsheet-validation',
  importValidation: 'import-validation',
  saveToDb: 'save-to-db'
}

module.exports = {
  accessImportUser,
  robotImportUser,
  stages
}
