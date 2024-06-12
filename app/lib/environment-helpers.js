/**
 * @param {string} variableName
 * @return {string|undefined}
 */
const getEnvironmentVariable = (variableName) => {
  return process.env[variableName]
}

module.exports = {
  getEnvironmentVariable
}
