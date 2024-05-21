const limitStringLength = (str, maxLen) => {
  if (!str) {
    return ''
  }

  return str.length > maxLen ? str.substr(0, maxLen) : str
}

const removeFromStartOfString = (fullStr, removeStr) => {
  if (!fullStr) {
    return ''
  }

  return fullStr.startsWith(removeStr) ? fullStr.substr(removeStr.length) : fullStr
}

module.exports = {
  limitStringLength,
  removeFromStartOfString
}
