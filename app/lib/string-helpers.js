const limitStringLength = (str, maxLen) => {
  if (!str) {
    return ''
  }

  return str.length > maxLen ? str.substr(0, maxLen) : str
}

module.exports = {
  limitStringLength
}
