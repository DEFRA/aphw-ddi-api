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

const extractShortNameAndDomain = (email) => {
  if (!email) {
    return {
      domain: email,
      shortName: 'unknown'
    }
  }

  const [, domain] = email.split('@')

  if (!domain) {
    return {
      domain: email,
      shortName: 'unknown'
    }
  }

  const shortName = domain.toLowerCase().replace('.pnn.police.uk', '').replace('.police.uk', '')

  return {
    domain,
    shortName
  }
}

module.exports = {
  limitStringLength,
  removeFromStartOfString,
  extractShortNameAndDomain
}
