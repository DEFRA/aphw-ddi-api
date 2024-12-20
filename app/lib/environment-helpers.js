/**
 * @param {string} variableName
 * @return {string|undefined}
 */
const getEnvironmentVariable = (variableName) => {
  return process.env[variableName]
}

const getEnvironmentVariableOrString = (variableName) => {
  return process.env[variableName] !== undefined ? process.env[variableName] : ''
}

const getEnvCode = (configItem) => {
  const envParts = configItem ? `${configItem}`.split('-') : []
  return envParts?.length === 4 ? envParts[3] : ''
}

module.exports = {
  getEnvironmentVariable,
  getEnvironmentVariableOrString,
  getEnvCode
}
