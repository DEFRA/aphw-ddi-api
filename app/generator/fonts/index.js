const path = require('path')
const fontPath = path.resolve(__dirname)

const fonts = {
  Arial: {
    normal: `${fontPath}/Arial.ttf`,
    bold: `${fontPath}/Arial_Bold.ttf`
  }
}

const findFont = (id) => {
  const components = id?.split('.')

  return fonts[components[0]][components[1]]
}

module.exports = {
  findFont
}
