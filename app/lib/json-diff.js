const { deepClone } = require('../lib/deep-clone')

const isoDateEnding = 'T00:00:00.000Z'

const jsonDiff = (obj1, obj2) => {
  return diff(deepClone(obj1), deepClone(obj2)) ?? {}
}

const diff = (obj1, obj2) => {
  const result = {}

  if (Object.is(obj1, obj2)) return result

  if (!obj2 || typeof obj2 !== 'object') return obj2

  Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
    let val

    if (!obj2[key]) obj2[key] = null

    if (`${obj2[key]}`.endsWith(isoDateEnding)) obj2[key] = obj2[key].substring(0, obj2[key].indexOf(isoDateEnding))

    if (obj1[key] === '' && !obj2[key]) obj2[key] = ''

    if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) val = [obj1[key], obj2[key]]

    if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
      const value = diff(obj1[key], obj2[key])
      if (value !== undefined) val = value
    } else if (val !== undefined) {
      result[key] = val
    }
  })
  return result
}

module.exports = {
  jsonDiff
}
